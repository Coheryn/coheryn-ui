//! CoherynUI CSS — Canonical Compiler Engine and Utility Registry
//!
//! Maps extracted tokens through syntax and registry resolution to generate
//! deterministic, cascade-layered standards-based CSS.

use coherynui_core::Declaration;
use coherynui_design::CoherynConfig;
use coherynui_diagnostics::{CompilerDiagnostic, DiagnosticSeverity};
use coherynui_source::SourceCandidate;
use coherynui_syntax::{parse_class, ParsedClassToken};
use std::collections::{BTreeMap, BTreeSet};

pub struct CompileResult {
    pub css: String,
    pub diagnostics: Vec<CompilerDiagnostic>,
    pub generated_classes: BTreeSet<String>,
}

/// Core compiler orchestrating the pipeline.
pub struct CoherynCompiler {
    config: CoherynConfig,
}

impl Default for CoherynCompiler {
    fn default() -> Self {
        Self {
            config: CoherynConfig::default(),
        }
    }
}

impl CoherynCompiler {
    pub fn new(config: CoherynConfig) -> Self {
        Self { config }
    }

    /// Compile a collection of extracted source candidates into final CSS output.
    pub fn compile_candidates(&self, candidates: &[SourceCandidate]) -> CompileResult {
        let mut diagnostics = Vec::new();
        let mut recognized_rules = BTreeMap::new();
        let mut generated_classes = BTreeSet::new();

        let class_prefix = &self.config.compiler.class_prefix;
        let layer_prefix = &self.config.compiler.layer_prefix;
        let var_prefix = &self.config.compiler.variable_prefix;

        for candidate in candidates {
            let raw_value = &candidate.value;
            let (is_match, class_to_parse) = if !class_prefix.is_empty() {
                if let Some(stripped) = raw_value.strip_prefix(class_prefix) {
                    (true, stripped)
                } else {
                    (false, raw_value.as_str())
                }
            } else {
                (true, raw_value.as_str())
            };

            if !is_match {
                continue;
            }

            match parse_class(class_to_parse, Some(candidate.span.clone())) {
                Ok(token) => {
                    let full_name = if let Some(v) = &token.value_part {
                        format!("{}-{}", token.base_utility, v)
                    } else {
                        token.base_utility.clone()
                    };

                    if let Some(css_decl) = self.resolve_token(&token) {
                        generated_classes.insert(candidate.value.clone());
                        let selector_str = format!(".{}", escape_selector(&candidate.value));
                        let key = (token.variants.clone(), selector_str.clone());
                        recognized_rules.entry(key).or_insert((token, css_decl));
                    } else if is_recipe_or_material(&token.base_utility) || is_recipe_or_material(&full_name) {
                        // Handled in recipes layer
                        generated_classes.insert(candidate.value.clone());
                    } else {
                        diagnostics.push(CompilerDiagnostic::new(
                            "CY1001",
                            DiagnosticSeverity::Warning,
                            format!("Unrecognized utility class '{}'", candidate.value),
                            Some(&candidate.span),
                        ));
                    }
                }
                Err(err) => {
                    diagnostics.push(CompilerDiagnostic::new(
                        "CY1000",
                        DiagnosticSeverity::Error,
                        format!("Syntax error in class: {}", err),
                        Some(&candidate.span),
                    ));
                }
            }
        }

        let mut out = String::new();
        out.push_str("/* CoherynUI CSS — Generated Stylesheet */\n");
        out.push_str(&format!(
            "@layer {layer_prefix}.reset, {layer_prefix}.tokens, {layer_prefix}.base, {layer_prefix}.recipes, {layer_prefix}.utilities;\n\n"
        ));

        // Layer: Reset
        out.push_str(&format!("@layer {layer_prefix}.reset {{\n"));
        out.push_str(&emit_coheryn_reset(var_prefix));
        out.push_str("}\n\n");

        // Layer: Tokens
        out.push_str(&format!("@layer {layer_prefix}.tokens {{\n"));
        out.push_str(&self.config.emit_css_tokens());
        out.push_str("}\n\n");

        // Layer: Recipes (Adaptive Layouts, Liquid Glass, etc.)
        out.push_str(&format!("@layer {layer_prefix}.recipes {{\n"));
        out.push_str(&emit_adaptive_layout_recipes(var_prefix));
        out.push('\n');
        out.push_str(&self.config.emit_liquid_glass_css());
        out.push_str("}\n\n");

        // Layer: Utilities
        out.push_str(&format!("@layer {layer_prefix}.utilities {{\n"));
        for ((variants, selector), (token, declarations)) in recognized_rules {
            let mut indent = "  ".to_string();
            let mut prefix = String::new();
            let mut suffix = String::new();
            let mut group_prefix = String::new();
            let mut peer_prefix = String::new();
            let mut pseudo_suffix = String::new();
            let mut element_suffix = String::new();
            let mut has_suffix = String::new();
            let mut theme_prefix = String::new();

            // Process variants
            for variant in &variants {
                let v = variant.0.as_str();
                match v {
                    // Viewport responsive
                    "sm" => {
                        prefix.push_str("  @media (min-width: 640px) {\n");
                        suffix.insert_str(0, "  }\n");
                        indent.push_str("  ");
                    }
                    "md" => {
                        prefix.push_str("  @media (min-width: 768px) {\n");
                        suffix.insert_str(0, "  }\n");
                        indent.push_str("  ");
                    }
                    "lg" => {
                        prefix.push_str("  @media (min-width: 1024px) {\n");
                        suffix.insert_str(0, "  }\n");
                        indent.push_str("  ");
                    }
                    "xl" => {
                        prefix.push_str("  @media (min-width: 1280px) {\n");
                        suffix.insert_str(0, "  }\n");
                        indent.push_str("  ");
                    }
                    "2xl" => {
                        prefix.push_str("  @media (min-width: 1536px) {\n");
                        suffix.insert_str(0, "  }\n");
                        indent.push_str("  ");
                    }

                    // Container queries
                    "cq" => {
                        prefix.push_str("  @container (min-width: 320px) {\n");
                        suffix.insert_str(0, "  }\n");
                        indent.push_str("  ");
                    }
                    "cq-sm" => {
                        prefix.push_str("  @container (min-width: 480px) {\n");
                        suffix.insert_str(0, "  }\n");
                        indent.push_str("  ");
                    }
                    "cq-md" => {
                        prefix.push_str("  @container (min-width: 640px) {\n");
                        suffix.insert_str(0, "  }\n");
                        indent.push_str("  ");
                    }
                    "cq-lg" => {
                        prefix.push_str("  @container (min-width: 800px) {\n");
                        suffix.insert_str(0, "  }\n");
                        indent.push_str("  ");
                    }

                    // Media feature variants
                    "motion-safe" => {
                        prefix.push_str("  @media (prefers-reduced-motion: no-preference) {\n");
                        suffix.insert_str(0, "  }\n");
                        indent.push_str("  ");
                    }
                    "motion-reduce" => {
                        prefix.push_str("  @media (prefers-reduced-motion: reduce) {\n");
                        suffix.insert_str(0, "  }\n");
                        indent.push_str("  ");
                    }
                    "print" => {
                        prefix.push_str("  @media print {\n");
                        suffix.insert_str(0, "  }\n");
                        indent.push_str("  ");
                    }
                    "contrast-more" => {
                        prefix.push_str("  @media (prefers-contrast: more) {\n");
                        suffix.insert_str(0, "  }\n");
                        indent.push_str("  ");
                    }
                    "portrait" => {
                        prefix.push_str("  @media (orientation: portrait) {\n");
                        suffix.insert_str(0, "  }\n");
                        indent.push_str("  ");
                    }
                    "landscape" => {
                        prefix.push_str("  @media (orientation: landscape) {\n");
                        suffix.insert_str(0, "  }\n");
                        indent.push_str("  ");
                    }

                    // Interactive state pseudos
                    "hover" => pseudo_suffix.push_str(":hover"),
                    "focus" => pseudo_suffix.push_str(":focus"),
                    "focus-visible" => pseudo_suffix.push_str(":focus-visible"),
                    "focus-within" => pseudo_suffix.push_str(":focus-within"),
                    "active" => pseudo_suffix.push_str(":active"),
                    "disabled" => pseudo_suffix.push_str(":disabled"),
                    "visited" => pseudo_suffix.push_str(":visited"),
                    "checked" => pseudo_suffix.push_str(":checked"),
                    "first" => pseudo_suffix.push_str(":first-child"),
                    "last" => pseudo_suffix.push_str(":last-child"),
                    "odd" => pseudo_suffix.push_str(":nth-child(odd)"),
                    "even" => pseudo_suffix.push_str(":nth-child(even)"),

                    // Pseudo-elements
                    "before" => element_suffix.push_str("::before"),
                    "after" => element_suffix.push_str("::after"),
                    "placeholder" => element_suffix.push_str("::placeholder"),
                    "selection" => element_suffix.push_str("::selection"),
                    "marker" => element_suffix.push_str("::marker"),

                    // Themes
                    "dark" => {
                        theme_prefix = "[data-theme=\"dark\"] ".to_string();
                    }

                    // Group variants
                    "group-hover" => group_prefix.push_str(".group:hover "),
                    "group-focus" => group_prefix.push_str(".group:focus "),
                    "group-focus-within" => group_prefix.push_str(".group:focus-within "),
                    "group-focus-visible" => group_prefix.push_str(".group:focus-visible "),
                    "group-active" => group_prefix.push_str(".group:active "),

                    // Peer variants
                    "peer-checked" => peer_prefix.push_str(".peer:checked ~ "),
                    "peer-focus" => peer_prefix.push_str(".peer:focus ~ "),
                    "peer-hover" => peer_prefix.push_str(".peer:hover ~ "),
                    "peer-disabled" => peer_prefix.push_str(".peer:disabled ~ "),

                    // Dynamic / arbitrary group, peer, and has-[...]
                    other => {
                        if other.starts_with("has-[") && other.ends_with(']') {
                            let inner = &other[5..other.len() - 1];
                            let clean_inner = inner.replace('_', " ");
                            has_suffix.push_str(&format!(":has({})", clean_inner));
                        } else if let Some(stripped) = other.strip_prefix("group-") {
                            group_prefix.push_str(&format!(".group:{} ", stripped));
                        } else if let Some(stripped) = other.strip_prefix("peer-") {
                            peer_prefix.push_str(&format!(".peer:{} ~ ", stripped));
                        }
                    }
                }
            }

            let final_selector = format!(
                "{}{}{}{}{}{}{}",
                theme_prefix, peer_prefix, group_prefix, selector, has_suffix, pseudo_suffix, element_suffix
            );

            out.push_str(&prefix);
            out.push_str(&format!("{}{final_selector} {{\n", indent));
            for decl in declarations {
                let important_suffix = if token.important { " !important" } else { "" };
                out.push_str(&format!(
                    "{}  {}: {}{};\n",
                    indent, decl.property, decl.value, important_suffix
                ));
            }
            out.push_str(&format!("{indent}}}\n"));
            out.push_str(&suffix);
        }
        out.push_str("}\n");

        CompileResult {
            css: out,
            diagnostics,
            generated_classes,
        }
    }

    /// Canonical registry resolver mapping base utility names to CSS declarations.
    fn resolve_token(&self, token: &ParsedClassToken) -> Option<Vec<Declaration>> {
        let base = token.base_utility.as_str();
        let val_opt = token.value_part.as_deref();

        // 1. Handle Arbitrary Values: p-[24px], bg-[#fff], w-[calc(100%-2rem)]
        if token.arbitrary {
            if let Some(val) = val_opt {
                let clean_val = val.replace('_', " ");
                return resolve_arbitrary(base, &clean_val, token.important);
            }
        }

        // 2. Canonical Registry Mapping
        if let Some(decl) = self.resolve_canonical(token) {
            return Some(decl);
        }

        // 3. Fallback: try compound utility if val_opt was split by rfind('-') (e.g. justify-between, items-center)
        if let Some(val) = val_opt {
            let mut compound_token = token.clone();
            compound_token.base_utility = format!("{}-{}", base, val);
            compound_token.value_part = None;
            if let Some(decl) = self.resolve_canonical(&compound_token) {
                return Some(decl);
            }
        }

        None
    }

    fn resolve_canonical(&self, token: &ParsedClassToken) -> Option<Vec<Declaration>> {
        let base = token.base_utility.as_str();
        let val_opt = token.value_part.as_deref();

        match (base, val_opt) {
            // Display
            ("flex", None) => decl("display", "flex", token.important),
            ("grid", None) => decl("display", "grid", token.important),
            ("block", None) => decl("display", "block", token.important),
            ("inline", None) => decl("display", "inline", token.important),
            ("inline-flex", None) => decl("display", "inline-flex", token.important),
            ("inline-grid", None) => decl("display", "inline-grid", token.important),
            ("hidden", None) => decl("display", "none", token.important),

            // Container Query Root
            ("cq-root", None) => decl("container-type", "inline-size", token.important),

            // Flexbox
            ("flex-col", None) => decl("flex-direction", "column", token.important),
            ("flex-row", None) => decl("flex-direction", "row", token.important),
            ("flex-wrap", None) => decl("flex-wrap", "wrap", token.important),
            ("flex-nowrap", None) => decl("flex-wrap", "nowrap", token.important),
            ("flex-1", None) => decl("flex", "1 1 0%", token.important),
            ("flex-auto", None) => decl("flex", "1 1 auto", token.important),
            ("flex-none", None) => decl("flex", "none", token.important),

            // Alignment
            ("items-start", None) => decl("align-items", "flex-start", token.important),
            ("items-center", None) => decl("align-items", "center", token.important),
            ("items-end", None) => decl("align-items", "flex-end", token.important),
            ("items-baseline", None) => decl("align-items", "baseline", token.important),
            ("items-stretch", None) => decl("align-items", "stretch", token.important),

            ("justify-start", None) => decl("justify-content", "flex-start", token.important),
            ("justify-center", None) => decl("justify-content", "center", token.important),
            ("justify-end", None) => decl("justify-content", "flex-end", token.important),
            ("justify-between", None) => decl("justify-content", "space-between", token.important),
            ("justify-around", None) => decl("justify-content", "space-around", token.important),
            ("justify-evenly", None) => decl("justify-content", "space-evenly", token.important),

            // Grid Template Columns
            ("cols", Some(n)) => {
                let col_val = format!("repeat({}, minmax(0, 1fr))", n);
                decl("grid-template-columns", &col_val, token.important)
            }
            ("col-span", Some(n)) => {
                let span_val = format!("span {} / span {}", n, n);
                decl("grid-column", &span_val, token.important)
            }

            // Sizing: Width & Height
            ("w", Some("full")) => decl("width", "100%", token.important),
            ("w", Some("screen")) => decl("width", "100vw", token.important),
            ("w", Some("auto")) => decl("width", "auto", token.important),
            ("w", Some("fit")) => decl("width", "fit-content", token.important),
            ("w", Some("1/2")) => decl("width", "50%", token.important),
            ("w", Some("1/3")) => decl("width", "33.333333%", token.important),
            ("w", Some("2/3")) => decl("width", "66.666667%", token.important),
            ("w", Some("1/4")) => decl("width", "25%", token.important),
            ("w", Some("2/4")) => decl("width", "50%", token.important),
            ("w", Some("3/4")) => decl("width", "75%", token.important),
            ("w", Some("1/5")) => decl("width", "20%", token.important),
            ("w", Some("2/5")) => decl("width", "40%", token.important),
            ("w", Some("3/5")) => decl("width", "60%", token.important),
            ("w", Some("4/5")) => decl("width", "80%", token.important),
            ("w", Some("1/6")) => decl("width", "16.666667%", token.important),
            ("w", Some("5/6")) => decl("width", "83.333333%", token.important),
            ("w", Some("1/12")) => decl("width", "8.333333%", token.important),
            ("w", Some("11/12")) => decl("width", "91.666667%", token.important),
            ("min-w", Some("0")) => decl("min-width", "0px", token.important),
            ("min-w", Some("full")) => decl("min-width", "100%", token.important),
            ("max-w", Some("xs")) => decl("max-width", "20rem", token.important),
            ("max-w", Some("sm")) => decl("max-width", "24rem", token.important),
            ("max-w", Some("md")) => decl("max-width", "28rem", token.important),
            ("max-w", Some("lg")) => decl("max-width", "32rem", token.important),
            ("max-w", Some("xl")) => decl("max-width", "36rem", token.important),
            ("max-w", Some("2xl")) => decl("max-width", "42rem", token.important),
            ("max-w", Some("prose")) => decl("max-width", "65ch", token.important),

            ("h", Some("full")) => decl("height", "100%", token.important),
            ("h", Some("screen")) => decl("height", "100vh", token.important),
            ("h", Some("dvh")) => decl("height", "100dvh", token.important),
            ("h", Some("svh")) => decl("height", "100svh", token.important),
            ("h", Some("lvh")) => decl("height", "100lvh", token.important),
            ("h", Some("auto")) => decl("height", "auto", token.important),
            ("min-h", Some("0")) => decl("min-height", "0px", token.important),
            ("min-h", Some("screen")) => decl("min-height", "100vh", token.important),
            ("min-h", Some("dvh")) => decl("min-height", "100dvh", token.important),
            ("min-h", Some("svh")) => decl("min-height", "100svh", token.important),
            ("max-h", Some("full")) => decl("max-height", "100%", token.important),
            ("max-h", Some("screen")) => decl("max-height", "100vh", token.important),
            ("max-h", Some("dvh")) => decl("max-height", "100dvh", token.important),

            // Spacing: Padding
            ("p", Some(val)) => decl("padding", &format_spacing(val), token.important),
            ("px", Some(val)) => {
                let s = format_spacing(val);
                decl2("padding-left", &s, "padding-right", &s, token.important)
            }
            ("py", Some(val)) => {
                let s = format_spacing(val);
                decl2("padding-top", &s, "padding-bottom", &s, token.important)
            }
            ("pt", Some(val)) => decl("padding-top", &format_spacing(val), token.important),
            ("pr", Some(val)) => decl("padding-right", &format_spacing(val), token.important),
            ("pb", Some(val)) => decl("padding-bottom", &format_spacing(val), token.important),
            ("pl", Some(val)) => decl("padding-left", &format_spacing(val), token.important),

            // Spacing: Margin
            ("m", Some(val)) => decl("margin", &format_spacing(val), token.important),
            ("mx", Some(val)) => {
                let s = format_spacing(val);
                decl2("margin-left", &s, "margin-right", &s, token.important)
            }
            ("my", Some(val)) => {
                let s = format_spacing(val);
                decl2("margin-top", &s, "margin-bottom", &s, token.important)
            }
            ("mt", Some(val)) => decl("margin-top", &format_spacing(val), token.important),
            ("mr", Some(val)) => decl("margin-right", &format_spacing(val), token.important),
            ("mb", Some(val)) => decl("margin-bottom", &format_spacing(val), token.important),
            ("ml", Some(val)) => decl("margin-left", &format_spacing(val), token.important),

            // Gap
            ("gap", Some(val)) => decl("gap", &format_spacing(val), token.important),
            ("gap-x", Some(val)) => decl("column-gap", &format_spacing(val), token.important),
            ("gap-y", Some(val)) => decl("row-gap", &format_spacing(val), token.important),

            // Radius
            ("radius", Some(val)) => {
                let r = match val {
                    "none" => "0px",
                    "sm" => "0.375rem",
                    "md" => "0.5rem",
                    "lg" => "0.75rem",
                    "xl" => "1rem",
                    "2xl" => "1.5rem",
                    "3xl" => "2rem",
                    "full" => "9999px",
                    other => other,
                };
                decl("border-radius", r, token.important)
            }

            // Typography
            ("text", Some(val)) => {
                let size = match val {
                    "xs" => "0.75rem",
                    "sm" => "0.875rem",
                    "base" => "1rem",
                    "lg" => "1.125rem",
                    "xl" => "1.25rem",
                    "2xl" => "1.5rem",
                    "3xl" => "1.875rem",
                    "4xl" => "2.25rem",
                    "5xl" => "3rem",
                    other => other,
                };
                decl("font-size", size, token.important)
            }
            ("weight", Some(val)) => {
                let w = match val {
                    "thin" => "100",
                    "light" => "300",
                    "normal" => "400",
                    "medium" => "500",
                    "semibold" => "600",
                    "bold" => "700",
                    "extrabold" => "800",
                    other => other,
                };
                decl("font-weight", w, token.important)
            }
            ("leading", Some(val)) => {
                let l = match val {
                    "none" => "1",
                    "tight" => "1.25",
                    "normal" => "1.5",
                    "loose" => "2",
                    other => other,
                };
                decl("line-height", l, token.important)
            }
            ("tracking", Some(val)) => {
                let tr = match val {
                    "tight" => "-0.025em",
                    "normal" => "0em",
                    "wide" => "0.025em",
                    other => other,
                };
                decl("letter-spacing", tr, token.important)
            }
            ("truncate", None) => Some(vec![
                Declaration { property: "overflow".into(), value: "hidden".into(), important: token.important },
                Declaration { property: "text-overflow".into(), value: "ellipsis".into(), important: token.important },
                Declaration { property: "white-space".into(), value: "nowrap".into(), important: token.important },
            ]),
            ("uppercase", None) => decl("text-transform", "uppercase", token.important),
            ("lowercase", None) => decl("text-transform", "lowercase", token.important),
            ("capitalize", None) => decl("text-transform", "capitalize", token.important),

            // Position & Coordinates
            ("relative", None) => decl("position", "relative", token.important),
            ("absolute", None) => decl("position", "absolute", token.important),
            ("fixed", None) => decl("position", "fixed", token.important),
            ("sticky", None) => decl("position", "sticky", token.important),
            ("static", None) => decl("position", "static", token.important),
            ("inset", Some("0")) => decl("inset", "0px", token.important),
            ("top", Some("0")) => decl("top", "0px", token.important),
            ("right", Some("0")) => decl("right", "0px", token.important),
            ("bottom", Some("0")) => decl("bottom", "0px", token.important),
            ("left", Some("0")) => decl("left", "0px", token.important),
            ("z", Some(val)) => decl("z-index", val, token.important),

            // Overflow
            ("overflow-hidden", None) => decl("overflow", "hidden", token.important),
            ("overflow-auto", None) => decl("overflow", "auto", token.important),
            ("overflow-scroll", None) => decl("overflow", "scroll", token.important),

            // Borders
            ("border", None) => {
                let vp = &self.config.compiler.variable_prefix;
                decl("border", &format!("1px solid var(--{}-border-color, rgba(226, 232, 240, 0.8))", vp), token.important)
            }
            ("border-subtle", None) => decl("border", "1px solid rgba(226, 232, 240, 0.4)", token.important),
            ("border-none", None) => decl("border", "none", token.important),

            // Shadows
            ("shadow-sm", None) => decl("box-shadow", "0 1px 2px 0 rgba(0, 0, 0, 0.05)", token.important),
            ("shadow-md", None) => decl("box-shadow", "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)", token.important),
            ("shadow-lg", None) => decl("box-shadow", "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)", token.important),
            ("shadow-xl", None) => decl("box-shadow", "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)", token.important),

            // Focus Ring System (Accessible Non-Layout-Shifting Rings)
            ("ring", None) => decl("box-shadow", "var(--cyn-ring-offset-shadow, 0 0 #0000), 0 0 0 calc(3px + var(--cyn-ring-offset-width, 0px)) var(--cyn-ring-color, var(--cyn-color-brand, #3b82f6)), var(--cyn-shadow, 0 0 #0000)", token.important),
            ("ring", Some("0")) => decl("box-shadow", "0 0 #0000", token.important),
            ("ring", Some("1")) => decl("box-shadow", "var(--cyn-ring-offset-shadow, 0 0 #0000), 0 0 0 calc(1px + var(--cyn-ring-offset-width, 0px)) var(--cyn-ring-color, var(--cyn-color-brand, #3b82f6)), var(--cyn-shadow, 0 0 #0000)", token.important),
            ("ring", Some("2")) => decl("box-shadow", "var(--cyn-ring-offset-shadow, 0 0 #0000), 0 0 0 calc(2px + var(--cyn-ring-offset-width, 0px)) var(--cyn-ring-color, var(--cyn-color-brand, #3b82f6)), var(--cyn-shadow, 0 0 #0000)", token.important),
            ("ring", Some("4")) => decl("box-shadow", "var(--cyn-ring-offset-shadow, 0 0 #0000), 0 0 0 calc(4px + var(--cyn-ring-offset-width, 0px)) var(--cyn-ring-color, var(--cyn-color-brand, #3b82f6)), var(--cyn-shadow, 0 0 #0000)", token.important),
            ("ring", Some("8")) => decl("box-shadow", "var(--cyn-ring-offset-shadow, 0 0 #0000), 0 0 0 calc(8px + var(--cyn-ring-offset-width, 0px)) var(--cyn-ring-color, var(--cyn-color-brand, #3b82f6)), var(--cyn-shadow, 0 0 #0000)", token.important),
            ("ring", Some("brand")) => decl("--cyn-ring-color", "var(--cyn-color-brand, #3b82f6)", token.important),
            ("ring", Some("subtle")) => decl("--cyn-ring-color", "rgba(226, 232, 240, 0.6)", token.important),
            ("ring", Some("danger")) => decl("--cyn-ring-color", "#ef4444", token.important),
            ("ring", Some("success")) => decl("--cyn-ring-color", "#10b981", token.important),
            ("ring", Some("white")) => decl("--cyn-ring-color", "#ffffff", token.important),
            ("ring-offset", Some("0")) => decl("--cyn-ring-offset-width", "0px", token.important),
            ("ring-offset", Some("1")) => decl("--cyn-ring-offset-width", "1px", token.important),
            ("ring-offset", Some("2")) => decl("--cyn-ring-offset-width", "2px", token.important),
            ("ring-offset", Some("4")) => decl("--cyn-ring-offset-width", "4px", token.important),
            ("ring-offset", Some("surface")) => decl("--cyn-ring-offset-color", "var(--cyn-color-surface, #ffffff)", token.important),
            ("ring-inset", None) => decl("--cyn-ring-inset", "inset", token.important),

            // Extended Transforms
            ("rotate", Some("0")) => decl("transform", "rotate(0deg)", token.important),
            ("rotate", Some("45")) => decl("transform", "rotate(45deg)", token.important),
            ("rotate", Some("90")) => decl("transform", "rotate(90deg)", token.important),
            ("rotate", Some("180")) => decl("transform", "rotate(180deg)", token.important),
            ("-rotate", Some("45")) | ("rotate", Some("-45")) => decl("transform", "rotate(-45deg)", token.important),
            ("-rotate", Some("90")) | ("rotate", Some("-90")) => decl("transform", "rotate(-90deg)", token.important),
            ("scale", Some("75")) => decl("transform", "scale(0.75)", token.important),
            ("scale", Some("90")) => decl("transform", "scale(0.9)", token.important),
            ("scale", Some("95")) => decl("transform", "scale(0.95)", token.important),
            ("scale", Some("100")) => decl("transform", "scale(1)", token.important),
            ("scale", Some("105")) => decl("transform", "scale(1.05)", token.important),
            ("scale", Some("110")) => decl("transform", "scale(1.1)", token.important),
            ("translate-x", Some("1/2")) => decl("transform", "translateX(50%)", token.important),
            ("translate-y", Some("1/2")) => decl("transform", "translateY(50%)", token.important),
            ("-translate-x", Some("1/2")) => decl("transform", "translateX(-50%)", token.important),
            ("-translate-y", Some("1/2")) => decl("transform", "translateY(-50%)", token.important),
            ("-translate-x", Some("full")) => decl("transform", "translateX(-100%)", token.important),
            ("-translate-y", Some("full")) => decl("transform", "translateY(-100%)", token.important),

            // Opacity
            ("opacity", Some("0")) => decl("opacity", "0", token.important),
            ("opacity", Some("25")) => decl("opacity", "0.25", token.important),
            ("opacity", Some("50")) => decl("opacity", "0.5", token.important),
            ("opacity", Some("75")) => decl("opacity", "0.75", token.important),
            ("opacity", Some("100")) => decl("opacity", "1", token.important),

            // Transitions & Motion
            ("transition-all", None) => decl("transition", "all 200ms cubic-bezier(0.4, 0, 0.2, 1)", token.important),
            ("transition-colors", None) => decl("transition", "color 150ms ease, background-color 150ms ease, border-color 150ms ease", token.important),
            ("transition-opacity", None) => decl("transition", "opacity 150ms ease", token.important),
            ("transition-transform", None) => decl("transition", "transform 200ms cubic-bezier(0.4, 0, 0.2, 1)", token.important),

            // Semantic Color Tokens
            ("bg", Some("surface")) => {
                let vp = &self.config.compiler.variable_prefix;
                decl("background-color", &format!("var(--{}-color-surface, #ffffff)", vp), token.important)
            }
            ("bg", Some("brand")) => {
                let vp = &self.config.compiler.variable_prefix;
                decl("background-color", &format!("var(--{}-color-brand, #3b82f6)", vp), token.important)
            }
            ("fg", Some("primary")) => {
                let vp = &self.config.compiler.variable_prefix;
                decl("color", &format!("var(--{}-color-foreground, #172033)", vp), token.important)
            }
            ("fg", Some("muted")) => decl("color", "rgba(100, 116, 139, 1)", token.important),

            // Touch & Gesture Ergonomics (COH-AMD-1.4)
            ("touch", Some("auto")) | ("touch-auto", None) => decl("touch-action", "auto", token.important),
            ("touch", Some("none")) | ("touch-none", None) => decl("touch-action", "none", token.important),
            ("touch-pan", Some("x")) | ("touch-pan-x", None) => decl("touch-action", "pan-x", token.important),
            ("touch-pan", Some("y")) | ("touch-pan-y", None) => decl("touch-action", "pan-y", token.important),
            ("touch", Some("pinch")) | ("touch-pinch", None) => decl("touch-action", "pinch-zoom", token.important),
            ("touch", Some("manipulation")) | ("touch-manipulation", None) => decl("touch-action", "manipulation", token.important),
            ("overscroll", Some("contain")) | ("overscroll-contain", None) => decl("overscroll-behavior", "contain", token.important),
            ("overscroll", Some("none")) | ("overscroll-none", None) => decl("overscroll-behavior", "none", token.important),
            ("tap", Some("transparent")) | ("tap-transparent", None) => decl("-webkit-tap-highlight-color", "transparent", token.important),
            ("select", Some("none")) | ("select-none", None) => decl2("user-select", "none", "-webkit-user-select", "none", token.important),
            ("touch", Some("target")) | ("touch-target", None) => {
                let vp = &self.config.compiler.variable_prefix;
                decl2(
                    "min-inline-size",
                    &format!("var(--{}-touch-min, 44px)", vp),
                    "min-block-size",
                    &format!("var(--{}-touch-min, 44px)", vp),
                    token.important,
                )
            }

            _ => None,
        }
    }
}

fn resolve_arbitrary(base: &str, val: &str, important: bool) -> Option<Vec<Declaration>> {
    match base {
        "p" => decl("padding", val, important),
        "px" => decl2("padding-left", val, "padding-right", val, important),
        "py" => decl2("padding-top", val, "padding-bottom", val, important),
        "m" => decl("margin", val, important),
        "mx" => decl2("margin-left", val, "margin-right", val, important),
        "my" => decl2("margin-top", val, "margin-bottom", val, important),
        "w" => decl("width", val, important),
        "h" => decl("height", val, important),
        "bg" => decl("background-color", val, important),
        "fg" => decl("color", val, important),
        "radius" => decl("border-radius", val, important),
        "border" => decl("border", val, important),
        "top" => decl("top", val, important),
        "bottom" => decl("bottom", val, important),
        "left" => decl("left", val, important),
        "right" => decl("right", val, important),
        _ => None,
    }
}

fn is_recipe_or_material(base: &str) -> bool {
    matches!(
        base,
        "glass"
            | "glass-strong"
            | "glass-soft"
            | "glass-edge"
            | "stack"
            | "cluster"
            | "grid-auto"
            | "center"
            | "sidebar"
            | "flow"
            | "cover"
            | "switcher"
    )
}

fn decl(property: &str, value: &str, important: bool) -> Option<Vec<Declaration>> {
    Some(vec![Declaration {
        property: property.to_string(),
        value: value.to_string(),
        important,
    }])
}

fn decl2(p1: &str, v1: &str, p2: &str, v2: &str, important: bool) -> Option<Vec<Declaration>> {
    Some(vec![
        Declaration {
            property: p1.to_string(),
            value: v1.to_string(),
            important,
        },
        Declaration {
            property: p2.to_string(),
            value: v2.to_string(),
            important,
        },
    ])
}

fn format_spacing(val: &str) -> String {
    match val {
        "0" => "0px".into(),
        "1" => "0.25rem".into(),
        "2" => "0.5rem".into(),
        "3" => "0.75rem".into(),
        "4" => "1rem".into(),
        "5" => "1.25rem".into(),
        "6" => "1.5rem".into(),
        "8" => "2rem".into(),
        "10" => "2.5rem".into(),
        "12" => "3rem".into(),
        "16" => "4rem".into(),
        "20" => "5rem".into(),
        "24" => "6rem".into(),
        other => {
            if other.ends_with("px") || other.ends_with("rem") || other.ends_with('%') {
                other.into()
            } else {
                format!("{}rem", other)
            }
        }
    }
}

fn escape_selector(s: &str) -> String {
    s.replace(':', "\\:")
        .replace('[', "\\[")
        .replace(']', "\\]")
        .replace('#', "\\#")
        .replace('!', "\\!")
        .replace('@', "\\@")
        .replace('/', "\\/")
}

fn emit_coheryn_reset(var_prefix: &str) -> String {
    format!(
r#"  *, *::before, *::after {{
    box-sizing: border-box;
    margin: 0;
    -webkit-tap-highlight-color: transparent;
  }}
  body {{
    line-height: 1.5;
    -webkit-font-smoothing: antialiased;
    color: var(--{var_prefix}-color-foreground, #172033);
    background-color: var(--{var_prefix}-color-surface, #ffffff);
  }}
  img, picture, video, canvas, svg {{
    display: block;
    max-width: 100%;
  }}
  input, button, textarea, select {{
    font: inherit;
  }}
"#)
}

fn emit_adaptive_layout_recipes(p: &str) -> String {
    format!(
r#"  /* Adaptive Layout Primitives (§6.4) */
  .stack {{
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
  }}
  .cluster {{
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }}
  .grid-auto {{
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(var(--{p}-grid-min, 16rem), 1fr));
  }}
  .center {{
    box-sizing: content-box;
    margin-inline: auto;
    max-width: var(--{p}-center-max, 60ch);
  }}
  .sidebar {{
    display: flex;
    flex-wrap: wrap;
    gap: var(--{p}-sidebar-gap, 1rem);
  }}
  .flow > * + * {{
    margin-block-start: var(--{p}-flow-space, 1rem);
  }}
  .cover {{
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }}
  .switcher {{
    display: flex;
    flex-wrap: wrap;
    gap: var(--{p}-switcher-gap, 1rem);
  }}
"#)
}

#[cfg(test)]
mod tests {
    use super::*;
    use coherynui_core::SourceSpan;

    #[test]
    fn test_default_cyn_prefixes() {
        let compiler = CoherynCompiler::new(CoherynConfig::default());
        let candidate = SourceCandidate {
            value: "flex".into(),
            span: SourceSpan::dummy(),
        };

        let result = compiler.compile_candidates(&[candidate]);
        assert!(result.css.contains("@layer cyn.reset, cyn.tokens, cyn.base, cyn.recipes, cyn.utilities;"));
        assert!(result.css.contains("@layer cyn.tokens {"));
        assert!(result.css.contains("@layer cyn.utilities {"));
        assert!(result.css.contains(".flex {"));
        assert!(result.css.contains("--cyn-color-surface: #ffffff;"));
    }

    #[test]
    fn test_custom_prefixes_compiler() {
        let mut config = CoherynConfig::default();
        config.compiler.layer_prefix = "brand".into();
        config.compiler.variable_prefix = "brand".into();
        config.compiler.class_prefix = "co-".into();

        let compiler = CoherynCompiler::new(config);
        let candidate1 = SourceCandidate {
            value: "co-flex".into(),
            span: SourceSpan::dummy(),
        };
        let candidate2 = SourceCandidate {
            value: "co-bg-surface".into(),
            span: SourceSpan::dummy(),
        };
        // This unprefixed class should be ignored when class_prefix is "co-"
        let candidate3 = SourceCandidate {
            value: "p-4".into(),
            span: SourceSpan::dummy(),
        };

        let result = compiler.compile_candidates(&[candidate1, candidate2, candidate3]);

        assert!(result.css.contains("@layer brand.reset, brand.tokens, brand.base, brand.recipes, brand.utilities;"));
        assert!(result.css.contains("@layer brand.utilities {"));
        assert!(result.css.contains(".co-flex {"));
        assert!(result.css.contains(".co-bg-surface {"));
        assert!(result.css.contains("var(--brand-color-surface, #ffffff)"));
        assert!(!result.generated_classes.contains("p-4"));
        assert!(result.generated_classes.contains("co-flex"));
        assert!(result.generated_classes.contains("co-bg-surface"));
    }

    #[test]
    fn test_touch_action_and_ergonomics_utilities() {
        let compiler = CoherynCompiler::new(CoherynConfig::default());
        let candidates = vec![
            SourceCandidate {
                value: "touch-none".into(),
                span: SourceSpan::dummy(),
            },
            SourceCandidate {
                value: "touch-pan-y".into(),
                span: SourceSpan::dummy(),
            },
            SourceCandidate {
                value: "overscroll-contain".into(),
                span: SourceSpan::dummy(),
            },
            SourceCandidate {
                value: "touch-target".into(),
                span: SourceSpan::dummy(),
            },
        ];

        let result = compiler.compile_candidates(&candidates);
        assert!(result.css.contains(".touch-none {\n    touch-action: none;\n  }"));
        assert!(result.css.contains(".touch-pan-y {\n    touch-action: pan-y;\n  }"));
        assert!(result.css.contains(".overscroll-contain {\n    overscroll-behavior: contain;\n  }"));
        assert!(result.css.contains("var(--cyn-touch-min, 44px)"));
        assert!(result.css.contains("-webkit-tap-highlight-color: transparent;"));
    }

    #[test]
    fn test_advanced_modifier_pipeline_and_ring_system() {
        let compiler = CoherynCompiler::new(CoherynConfig::default());
        let candidates = vec![
            SourceCandidate { value: "group-hover:bg-brand".into(), span: SourceSpan::dummy() },
            SourceCandidate { value: "peer-checked:hidden".into(), span: SourceSpan::dummy() },
            SourceCandidate { value: "has-[:checked]:bg-surface".into(), span: SourceSpan::dummy() },
            SourceCandidate { value: "before:block".into(), span: SourceSpan::dummy() },
            SourceCandidate { value: "selection:bg-brand".into(), span: SourceSpan::dummy() },
            SourceCandidate { value: "motion-safe:transition-all".into(), span: SourceSpan::dummy() },
            SourceCandidate { value: "ring-2".into(), span: SourceSpan::dummy() },
            SourceCandidate { value: "ring-brand".into(), span: SourceSpan::dummy() },
            SourceCandidate { value: "ring-offset-2".into(), span: SourceSpan::dummy() },
            SourceCandidate { value: "w-1/2".into(), span: SourceSpan::dummy() },
            SourceCandidate { value: "w-3/4".into(), span: SourceSpan::dummy() },
            SourceCandidate { value: "h-dvh".into(), span: SourceSpan::dummy() },
            SourceCandidate { value: "rotate-45".into(), span: SourceSpan::dummy() },
            SourceCandidate { value: "-rotate-45".into(), span: SourceSpan::dummy() },
            SourceCandidate { value: "scale-95".into(), span: SourceSpan::dummy() },
            SourceCandidate { value: "-translate-x-1/2".into(), span: SourceSpan::dummy() },
        ];

        let result = compiler.compile_candidates(&candidates);
        assert!(result.css.contains(".group:hover .group-hover\\:bg-brand"));
        assert!(result.css.contains(".peer:checked ~ .peer-checked\\:hidden"));
        assert!(result.css.contains(".has-\\[\\:checked\\]\\:bg-surface:has(:checked)"));
        assert!(result.css.contains(".before\\:block::before"));
        assert!(result.css.contains(".selection\\:bg-brand::selection"));
        assert!(result.css.contains("@media (prefers-reduced-motion: no-preference)"));
        assert!(result.css.contains(".ring-2 {"));
        assert!(result.css.contains(".ring-brand {"));
        assert!(result.css.contains(".ring-offset-2 {"));
        assert!(result.css.contains(".w-1\\/2 {"));
        assert!(result.css.contains(".w-3\\/4 {"));
        assert!(result.css.contains(".h-dvh {"));
        assert!(result.css.contains(".rotate-45 {"));
        assert!(result.css.contains(".-rotate-45 {"));
        assert!(result.css.contains(".scale-95 {"));
        assert!(result.css.contains(".-translate-x-1\\/2 {"));
    }
}

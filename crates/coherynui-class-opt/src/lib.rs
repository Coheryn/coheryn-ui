//! CoherynUI CSS — Production Class Renaming & Optimization Engine
//!
//! Provides AST-aware deterministic class renaming, manifest generation,
//! safelisting, and fail-closed dynamic class verification for production builds.

use serde::{Deserialize, Serialize};
use std::collections::{BTreeMap, BTreeSet};
use thiserror::Error;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum RenamingMode {
    Off,
    Safe,
    Aggressive,
}

#[derive(Debug, Error, PartialEq, Eq)]
pub enum RenamingError {
    #[error("Unsafe dynamic class computation detected: '{expression}'. Safelist this class or use static references.")]
    UnsafeDynamicClass { expression: String },
}

/// Versioned class renaming manifest mapping original classes to mangled short names.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct RenamingManifest {
    pub version: String,
    pub mode: RenamingMode,
    pub mappings: BTreeMap<String, String>,
    pub reverse_mappings: BTreeMap<String, String>,
}

impl RenamingManifest {
    pub fn new(mode: RenamingMode) -> Self {
        Self {
            version: "1.0".to_string(),
            mode,
            mappings: BTreeMap::new(),
            reverse_mappings: BTreeMap::new(),
        }
    }

    /// Generates short unique identifiers (e.g. a, b, c, ... z, a0, a1...)
    /// avoiding reserved keywords and respecting safelists.
    pub fn generate_from_classes(
        classes: &BTreeSet<String>,
        mode: RenamingMode,
        safelist: &BTreeSet<String>,
    ) -> Self {
        let mut manifest = Self::new(mode);
        if mode == RenamingMode::Off {
            return manifest;
        }

        let mut counter = 0;
        for class_name in classes {
            // Safelist preservation: keep public API, test selectors, or author classes
            if safelist.contains(class_name) || class_name.starts_with("data-") {
                continue;
            }

            let mut short_name = index_to_identifier(counter);
            while is_reserved_identifier(&short_name) {
                counter += 1;
                short_name = index_to_identifier(counter);
            }
            counter += 1;

            manifest.mappings.insert(class_name.clone(), short_name.clone());
            manifest.reverse_mappings.insert(short_name, class_name.clone());
        }

        manifest
    }

    pub fn to_json(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string_pretty(self)
    }

    pub fn from_json(json: &str) -> Result<Self, serde_json::Error> {
        serde_json::from_str(json)
    }

    pub fn lookup(&self, original: &str) -> Option<&String> {
        self.mappings.get(original)
    }

    pub fn explain(&self, mangled: &str) -> Option<&String> {
        self.reverse_mappings.get(mangled)
    }
}

/// Rewriter for HTML markup, templates, and CSS stylesheets.
pub struct ClassRewriter;

impl ClassRewriter {
    /// Rewrites class attributes inside HTML / JSX text.
    pub fn rewrite_markup(content: &str, manifest: &RenamingManifest) -> String {
        if manifest.mode == RenamingMode::Off || manifest.mappings.is_empty() {
            return content.to_string();
        }

        let mut result = String::with_capacity(content.len());
        let patterns = ["class=\"", "className=\"", "class='", "className='"];

        let mut cursor = 0;
        while cursor < content.len() {
            let mut earliest_match = None;
            for pattern in &patterns {
                if let Some(pos) = content[cursor..].find(pattern) {
                    let absolute_pos = cursor + pos;
                    match earliest_match {
                        None => earliest_match = Some((absolute_pos, *pattern)),
                        Some((earliest_pos, _)) if absolute_pos < earliest_pos => {
                            earliest_match = Some((absolute_pos, *pattern));
                        }
                        _ => {}
                    }
                }
            }

            if let Some((attr_start, pattern)) = earliest_match {
                result.push_str(&content[cursor..attr_start]);
                result.push_str(pattern);

                let quote_char = if pattern.ends_with('"') { '"' } else { '\'' };
                let val_start = attr_start + pattern.len();

                if let Some(val_end) = content[val_start..].find(quote_char) {
                    let class_blob = &content[val_start..val_start + val_end];
                    let mut rewritten_classes = Vec::new();

                    for token in class_blob.split_whitespace() {
                        if let Some(mangled) = manifest.lookup(token) {
                            rewritten_classes.push(mangled.as_str());
                        } else {
                            rewritten_classes.push(token);
                        }
                    }

                    result.push_str(&rewritten_classes.join(" "));
                    result.push(quote_char);
                    cursor = val_start + val_end + 1;
                } else {
                    result.push_str(&content[val_start..]);
                    break;
                }
            } else {
                result.push_str(&content[cursor..]);
                break;
            }
        }

        result
    }

    /// Rewrites CSS class selectors according to the manifest.
    pub fn rewrite_css(css: &str, manifest: &RenamingManifest) -> String {
        if manifest.mode == RenamingMode::Off || manifest.mappings.is_empty() {
            return css.to_string();
        }

        let mut out = css.to_string();
        for (original, mangled) in &manifest.mappings {
            let escaped_orig = format!(".{}", escape_css_class(original));
            let escaped_mangled = format!(".{}", escape_css_class(mangled));
            out = out.replace(&escaped_orig, &escaped_mangled);
        }
        out
    }

    /// Fail-closed dynamic class verification for aggressive mode.
    /// Emits error if dynamic expressions construct un-safelisted classes.
    pub fn verify_dynamic_safety(content: &str, safelist: &BTreeSet<String>) -> Result<(), RenamingError> {
        // Detect `${...}` inside class attributes
        let dynamic_indicators = ["${", "className={", ":class=\"{"];
        for indicator in dynamic_indicators {
            if let Some(pos) = content.find(indicator) {
                let snippet: String = content[pos..].chars().take(40).collect();
                // If not explicitly declared in safelist, fail closed
                if !safelist.iter().any(|s| snippet.contains(s)) {
                    return Err(RenamingError::UnsafeDynamicClass {
                        expression: snippet.trim().to_string(),
                    });
                }
            }
        }
        Ok(())
    }
}

fn index_to_identifier(mut idx: usize) -> String {
    let alphabet = b"abcdefghijklmnopqrstuvwxyz";
    let mut result = String::new();
    result.push(alphabet[idx % 26] as char);
    idx /= 26;
    while idx > 0 {
        idx -= 1;
        result.push(alphabet[idx % 26] as char);
        idx /= 26;
    }
    result
}

fn is_reserved_identifier(id: &str) -> bool {
    matches!(
        id,
        "ad" | "as" | "do" | "if" | "in" | "is" | "of" | "on" | "to" | "id" | "em"
    )
}

fn escape_css_class(s: &str) -> String {
    s.replace(':', "\\:")
        .replace('[', "\\[")
        .replace(']', "\\]")
        .replace('#', "\\#")
        .replace('!', "\\!")
        .replace('@', "\\@")
        .replace('/', "\\/")
}

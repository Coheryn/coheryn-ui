//! CoherynUI Agent API — Introspection, Diagnostics Verification & Project Planning
//!
//! Provides typed, version-stable data models and safe validation contracts
//! used by the CoherynUI MCP server, Agent Skills, and CLI agent tooling.

use coherynui_design::CoherynConfig;
use coherynui_diagnostics::DiagnosticSeverity;
use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use std::path::{Path, PathBuf};

/// Version of the agent API data exchange schema.
pub const AGENT_SCHEMA_VERSION: &str = "1.0";
pub const COHERYNUI_VERSION: &str = "1.0.0";

/// Result of inspecting a project's CoherynUI configuration and installed environment.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectInspection {
    pub schema_version: String,
    pub coheryn_version: String,
    pub is_coheryn_project: bool,
    pub config_path: Option<PathBuf>,
    pub layer_prefix: String,
    pub variable_prefix: String,
    pub class_prefix: String,
    pub themes: Vec<String>,
    pub installed_modules: Vec<String>,
    pub framework: Option<String>,
    pub root_dir: PathBuf,
}

impl ProjectInspection {
    /// Inspect a given project directory path for CoherynUI configuration and dependencies.
    pub fn inspect(root: &Path) -> Self {
        let config_file = root.join("coherynui.config.toml");
        let has_config = config_file.exists();

        let mut layer_prefix = "cyn".to_string();
        let mut variable_prefix = "cyn".to_string();
        let mut class_prefix = String::new();
        let mut themes = vec!["light".to_string(), "dark".to_string()];

        if has_config {
            if let Ok(content) = std::fs::read_to_string(&config_file) {
                if let Ok(config) = CoherynConfig::parse(&content) {
                    layer_prefix = config.compiler.layer_prefix;
                    variable_prefix = config.compiler.variable_prefix;
                    class_prefix = config.compiler.class_prefix;
                    themes = config.theme.available;
                }
            }
        }

        let mut installed_modules = Vec::new();
        let mut framework = None;

        let pkg_json = root.join("package.json");
        if pkg_json.exists() {
            if let Ok(content) = std::fs::read_to_string(&pkg_json) {
                if content.contains("@coherynui/react") {
                    installed_modules.push("@coherynui/react".to_string());
                    framework = Some("react".to_string());
                }
                if content.contains("@coherynui/components") {
                    installed_modules.push("@coherynui/components".to_string());
                }
                if content.contains("@coherynui/motion") {
                    installed_modules.push("@coherynui/motion".to_string());
                }
                if content.contains("@coherynui/gpu-materials") {
                    installed_modules.push("@coherynui/gpu-materials".to_string());
                }
                if content.contains("@coherynui/tokens") {
                    installed_modules.push("@coherynui/tokens".to_string());
                }
            }
        }

        Self {
            schema_version: AGENT_SCHEMA_VERSION.to_string(),
            coheryn_version: COHERYNUI_VERSION.to_string(),
            is_coheryn_project: has_config || !installed_modules.is_empty(),
            config_path: if has_config { Some(config_file) } else { None },
            layer_prefix,
            variable_prefix,
            class_prefix,
            themes,
            installed_modules,
            framework,
            root_dir: root.to_path_buf(),
        }
    }
}

/// A structured code diagnostic with location and safe-fix guidance.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentDiagnostic {
    pub code: String,
    pub severity: DiagnosticSeverity,
    pub message: String,
    pub location: Option<DiagnosticLocation>,
    pub fix: Option<DiagnosticFix>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiagnosticLocation {
    pub file: String,
    pub line: usize,
    pub column: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DiagnosticFix {
    pub kind: String,
    pub safe: bool,
    pub replacement: Option<String>,
}

/// Request to validate source snippet or project-scoped classes.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodeValidationRequest {
    pub file_path: Option<String>,
    pub content: String,
    pub strict: bool,
}

/// Structured validation response returned to agents.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CodeValidationResponse {
    pub schema_version: String,
    pub valid: bool,
    pub recognized_classes: Vec<String>,
    pub unknown_classes: Vec<String>,
    pub diagnostics: Vec<AgentDiagnostic>,
}

/// Proposed component implementation or project migration plan.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectPlan {
    pub title: String,
    pub target_framework: String,
    pub recommended_components: Vec<String>,
    pub required_packages: Vec<String>,
    pub optional_packages: Vec<String>,
    pub steps: Vec<String>,
    pub notes: Vec<String>,
}

/// Migration mapping analysis report.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MigrationAnalysis {
    pub source_framework: String,
    pub mapped_classes: BTreeMap<String, String>,
    pub unmapped_classes: Vec<String>,
    pub estimated_coverage: f32,
    pub guidance: Vec<String>,
}

/// An official versioned Agent Skill (COH-AMD-1.3 §4).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentSkill {
    pub id: String,
    pub name: String,
    pub description: String,
    pub content: String,
}

/// Supported agent client families (COH-AMD-1.3 §5.2).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum AgentClientFamily {
    Codex,
    Claude,
    Cursor,
    Copilot,
    All,
}

/// Proposed configuration template for a specific agent client family.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AgentConfigTemplate {
    pub client: String,
    pub relative_path: PathBuf,
    pub description: String,
    pub content: String,
}

/// Returns the 7 official versioned Agent Skills defined by COH-AMD-1.3 §4.
pub fn get_official_skills() -> Vec<AgentSkill> {
    vec![
        AgentSkill {
            id: "coherynui".to_string(),
            name: "coherynui".to_string(),
            description: "Detect, install, configure, build, check, and explain core CoherynUI styling and compiler workflows.".to_string(),
            content: include_str!("../../../agent/skills/coherynui/SKILL.md").to_string(),
        },
        AgentSkill {
            id: "coherynui-components".to_string(),
            name: "coherynui-components".to_string(),
            description: "Search, select, and compose accessible CoherynUI components with strict focus and keyboard management.".to_string(),
            content: include_str!("../../../agent/skills/coherynui-components/SKILL.md").to_string(),
        },
        AgentSkill {
            id: "coherynui-liquid-glass".to_string(),
            name: "coherynui-liquid-glass".to_string(),
            description: "Select CSS and GPU Liquid Glass material tiers, apply fallbacks, and validate optical refraction effects.".to_string(),
            content: include_str!("../../../agent/skills/coherynui-liquid-glass/SKILL.md").to_string(),
        },
        AgentSkill {
            id: "coherynui-motion".to_string(),
            name: "coherynui-motion".to_string(),
            description: "Implement physics-driven spring animations, FLIP layout morphing, and reduced-motion interactions with CoherynUI Motion.".to_string(),
            content: include_str!("../../../agent/skills/coherynui-motion/SKILL.md").to_string(),
        },
        AgentSkill {
            id: "coherynui-design-system".to_string(),
            name: "coherynui-design-system".to_string(),
            description: "Configure tokens, themes, semantic recipes, and design system invariants in coherynui.config.toml.".to_string(),
            content: include_str!("../../../agent/skills/coherynui-design-system/SKILL.md").to_string(),
        },
        AgentSkill {
            id: "coherynui-migration".to_string(),
            name: "coherynui-migration".to_string(),
            description: "Safely analyze and migrate codebases from legacy utility CSS to CoherynUI.".to_string(),
            content: include_str!("../../../agent/skills/coherynui-migration/SKILL.md").to_string(),
        },
        AgentSkill {
            id: "coherynui-audit".to_string(),
            name: "coherynui-audit".to_string(),
            description: "Validate generated code, parse structured compiler diagnostics (CYxxxx), and verify UI quality.".to_string(),
            content: include_str!("../../../agent/skills/coherynui-audit/SKILL.md").to_string(),
        },
    ]
}

/// Generates client-specific configuration templates for supported AI coding assistants.
pub fn get_client_templates(
    _root: &Path,
    inspection: &ProjectInspection,
) -> Vec<AgentConfigTemplate> {
    let lp = &inspection.layer_prefix;
    let vp = &inspection.variable_prefix;

    let universal_guidelines = format!(
        r#"# CoherynUI Project Directives

This project uses **CoherynUI** (https://coheryntech.com/coherynui) for styling, components, motion, and GPU materials.

1. **Installed APIs Only**: Always inspect the installed version and use documented classes and components.
2. **Deterministic Layers**: Emit styles inside @layer {lp}.reset, {lp}.tokens, {lp}.base, {lp}.recipes, {lp}.utilities;.
3. **Variable Prefix**: Use CSS variables with prefix '--{vp}-*' (e.g. --{vp}-color-surface, --{vp}-space-4).
4. **Touch Ergonomics (COH-AMD-1.4)**: Enforce WCAG 2.2 SC 2.5.8 (min 44×44px hit bounds) using '--{vp}-touch-min', '.touch-target', and '.tap-transparent'.
5. **No Competitor Frameworks**: Never import or generate competitor framework utility classes or dependencies.
6. **Validation**: Run `coherynui check --format json` after generating or modifying styling code.
"#
    );

    let cursor_mdc = format!(
        r#"---
description: CoherynUI styling, component composition, touch ergonomics, and cascade layer rules
globs: ["**/*.tsx", "**/*.jsx", "**/*.html", "**/*.vue", "**/*.svelte", "**/*.css"]
alwaysApply: true
---

# CoherynUI Cursor Rules

- **Framework**: CoherynUI (https://coheryntech.com/coherynui)
- **Cascade Layer Order**: `@layer {lp}.reset, {lp}.tokens, {lp}.base, {lp}.recipes, {lp}.utilities;`
- **Touch Target Contract**: Ensure 44×44px touch targets on buttons, switches, and interactive elements (`.touch-target`).
- **Layout Recipes**: Prefer `.stack`, `.cluster`, `.grid-auto`, `.center`, and `.glass` over ad-hoc flex layouts.
- **Validation**: Validate classes using `coherynui check --format json`.
"#
    );

    vec![
        AgentConfigTemplate {
            client: "Codex / Universal".to_string(),
            relative_path: PathBuf::from("AGENTS.md"),
            description: "Standard repository-level instructions for coding agents".to_string(),
            content: universal_guidelines.clone(),
        },
        AgentConfigTemplate {
            client: "Claude Code".to_string(),
            relative_path: PathBuf::from("CLAUDE.md"),
            description: "Project context and guidelines for Claude Code".to_string(),
            content: format!(
                r#"# Claude Code Instructions — CoherynUI

{universal_guidelines}
## Common Commands
- Build CSS: `coherynui build --input . --output coherynui.css`
- Check Diagnostics: `coherynui check --format json`
- Explain Classes: `coherynui explain "<classes>"`
"#
            ),
        },
        AgentConfigTemplate {
            client: "Cursor".to_string(),
            relative_path: PathBuf::from(".cursor/rules/coherynui.mdc"),
            description: "Cursor AI editor rules file".to_string(),
            content: cursor_mdc,
        },
        AgentConfigTemplate {
            client: "GitHub Copilot".to_string(),
            relative_path: PathBuf::from(".github/copilot-instructions.md"),
            description: "GitHub Copilot workspace instructions".to_string(),
            content: format!(
                r#"# GitHub Copilot Instructions — CoherynUI

{universal_guidelines}
"#
            ),
        },
    ]
}


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

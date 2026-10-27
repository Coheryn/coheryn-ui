//! CoherynUI CSS — Diagnostics and Structured Compiler Reports
//!
//! Provides stable diagnostic codes (CY1xxx syntax, CY2xxx conflicts, CY3xxx tokens),
//! machine-readable JSON schemas, and terminal formatting.

use coherynui_core::SourceSpan;
use miette::Diagnostic;
use serde::{Deserialize, Serialize};
use thiserror::Error;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum DiagnosticSeverity {
    Error,
    Warning,
    Information,
}

/// A structured diagnostic report entry.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize, Diagnostic, Error)]
#[error("{message}")]
#[diagnostic(code(coherynui::diagnostic))]
pub struct CompilerDiagnostic {
    pub code: String,
    pub severity: DiagnosticSeverity,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub file: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub line: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub column: Option<u32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub suggestion: Option<String>,
}

impl CompilerDiagnostic {
    pub fn new(
        code: impl Into<String>,
        severity: DiagnosticSeverity,
        message: impl Into<String>,
        span: Option<&SourceSpan>,
    ) -> Self {
        Self {
            code: code.into(),
            severity,
            message: message.into(),
            file: span.map(|s| s.file.clone()),
            line: span.map(|s| s.start_line),
            column: span.map(|s| s.start_col),
            suggestion: None,
        }
    }

    pub fn with_suggestion(mut self, suggestion: impl Into<String>) -> Self {
        self.suggestion = Some(suggestion.into());
        self
    }
}

/// Container for versioned diagnostic reports (schemaVersion: "1.0").
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct DiagnosticReport {
    pub schema_version: String,
    pub diagnostics: Vec<CompilerDiagnostic>,
}

impl DiagnosticReport {
    pub fn new(diagnostics: Vec<CompilerDiagnostic>) -> Self {
        Self {
            schema_version: "1.0".to_string(),
            diagnostics,
        }
    }

    pub fn to_json(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string_pretty(self)
    }
}

pub mod codes {
    pub const UNKNOWN_UTILITY: &str = "CY1001";
    pub const DEPRECATED_TOKEN: &str = "CY1002";
    pub const MISSING_ARIA_CONTRACT: &str = "CY2001";
    pub const LOW_CONTRAST_RATIO: &str = "CY2002";
    pub const FOCUS_TRAP_MISSING: &str = "CY2003";
    pub const TOUCH_TARGET_UNDER_44PX: &str = "CY2004";
    pub const MISSING_SHADER_FALLBACK: &str = "CY3001";
    pub const MISSING_REDUCED_MOTION: &str = "CY3002";
}

impl CompilerDiagnostic {
    /// Helper to create a touch target ergonomic warning (WCAG 2.2 SC 2.5.8).
    pub fn touch_target_warning(element_desc: &str, size_px: u32, span: Option<&SourceSpan>) -> Self {
        Self::new(
            codes::TOUCH_TARGET_UNDER_44PX,
            DiagnosticSeverity::Warning,
            format!(
                "Interactive element '{}' has size {}px, which is under the 44px minimum touch target threshold (WCAG 2.2 SC 2.5.8).",
                element_desc, size_px
            ),
            span,
        )
        .with_suggestion("Apply '.touch-target' or increase padding to guarantee at least 44x44px touch area.")
    }
}


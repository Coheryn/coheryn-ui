use coherynui_compiler::CoherynCompiler;
use coherynui_core::SourceSpan;
use coherynui_design::CoherynConfig;
use coherynui_diagnostics::{CompilerDiagnostic, DiagnosticSeverity};
use coherynui_source::SourceCandidate;

#[test]
fn test_compiler_unknown_utility_diagnostic_cy1001() {
    let compiler = CoherynCompiler::new(CoherynConfig::default());
    let candidates = vec![SourceCandidate::new(
        "nonexistent-utility-token-xyz",
        SourceSpan::new("index.html", 42, 15, 42, 44),
    )];

    let result = compiler.compile_candidates(&candidates);

    // Should generate CY1001 warning
    let diag = result
        .diagnostics
        .iter()
        .find(|d| d.code == "CY1001")
        .expect("Compiler must generate CY1001 diagnostic for unknown tokens");

    assert_eq!(diag.severity, DiagnosticSeverity::Warning);
    assert_eq!(diag.file, Some("index.html".to_string()));
    assert_eq!(diag.line, Some(42));
    assert_eq!(diag.column, Some(15));
}

#[test]
fn test_diagnostic_json_serialization_contract() {
    let diag = CompilerDiagnostic::new(
        "CY2001",
        DiagnosticSeverity::Error,
        "Interactive dialog missing 'aria-modal=\"true\"' attribute",
        None,
    )
    .with_suggestion("Add aria-modal=\"true\" to <div role=\"dialog\"> container");

    let json = serde_json::to_string_pretty(&diag).expect("Diagnostic must serialize to JSON");

    assert!(json.contains("\"code\": \"CY2001\""));
    assert!(json.contains("\"severity\": \"error\""));
    assert!(json.contains("\"suggestion\": \"Add aria-modal=\\\"true\\\" to <div role=\\\"dialog\\\"> container\""));

    // Roundtrip deserialization
    let deserialized: CompilerDiagnostic =
        serde_json::from_str(&json).expect("Diagnostic JSON must deserialize cleanly");
    assert_eq!(deserialized.code, "CY2001");
    assert_eq!(deserialized.severity, DiagnosticSeverity::Error);
}

#[test]
fn test_accessibility_and_material_diagnostic_codes_conformance() {
    let codes = [
        ("CY1001", DiagnosticSeverity::Warning, "UnknownUtilityToken"),
        ("CY1002", DiagnosticSeverity::Warning, "DeprecatedToken"),
        ("CY2001", DiagnosticSeverity::Error, "MissingAriaContract"),
        ("CY2002", DiagnosticSeverity::Warning, "LowContrastRatio"),
        ("CY2003", DiagnosticSeverity::Error, "FocusTrapMissing"),
        ("CY3001", DiagnosticSeverity::Error, "MissingShaderFallback"),
        ("CY3002", DiagnosticSeverity::Warning, "MissingReducedMotion"),
    ];

    for (code, severity, name) in codes {
        let diag = CompilerDiagnostic::new(code, severity, format!("Validation violation: {}", name), None);
        assert_eq!(diag.code, code);
        assert_eq!(diag.severity, severity);
    }
}

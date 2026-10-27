use coherynui_compiler::CoherynCompiler;
use coherynui_design::CoherynConfig;
use coherynui_source::extract_candidates_from_str;

#[test]
fn test_first_acceptance_fixture() {
    let fixture_html = include_str!("../../../tests/fixtures/first_acceptance/index.html");
    let candidates = extract_candidates_from_str(fixture_html, "index.html");

    assert!(!candidates.is_empty(), "Candidates should not be empty");

    let compiler = CoherynCompiler::new(CoherynConfig::default());
    let result = compiler.compile_candidates(&candidates);

    // Verify all recognized classes from fixture
    let expected_classes = [
        "flex",
        "items-center",
        "justify-center",
        "min-h-screen",
        "p-6",
        "radius-xl",
        "bg-surface",
        "text-2xl",
        "weight-bold",
        "fg-primary",
    ];

    for expected in &expected_classes {
        assert!(
            result.generated_classes.contains(*expected),
            "Expected generated class '{}' was missing in {:?}",
            expected,
            result.generated_classes
        );
    }

    // Verify deterministic layers emitted with default 'cyn' prefix
    assert!(result.css.contains("@layer cyn.reset, cyn.tokens, cyn.base, cyn.recipes, cyn.utilities;"));
    assert!(result.css.contains("@layer cyn.tokens"));
    assert!(result.css.contains("@layer cyn.recipes"));
    assert!(result.css.contains("@layer cyn.utilities"));

    // Verify theme variables with default 'cyn' prefix
    assert!(result.css.contains("--cyn-color-surface: #ffffff;"));
    assert!(result.css.contains("--cyn-color-foreground: #172033;"));

    // Verify zero diagnostics (all valid utilities)
    assert_eq!(result.diagnostics.len(), 0, "Expected zero diagnostics on valid fixture");
}

#[test]
fn test_custom_prefix_acceptance() {
    let fixture_html = include_str!("../../../tests/fixtures/first_acceptance/index.html");
    let candidates = extract_candidates_from_str(fixture_html, "index.html");

    let mut config = CoherynConfig::default();
    config.compiler.layer_prefix = "custom_layer".into();
    config.compiler.variable_prefix = "custom_var".into();

    let compiler = CoherynCompiler::new(config);
    let result = compiler.compile_candidates(&candidates);

    assert!(result.css.contains("@layer custom_layer.reset, custom_layer.tokens, custom_layer.base, custom_layer.recipes, custom_layer.utilities;"));
    assert!(result.css.contains("--custom_var-color-surface: #ffffff;"));
    assert!(result.css.contains("--custom_var-color-foreground: #172033;"));
    assert!(result.css.contains("var(--custom_var-color-surface, #ffffff)"));
}

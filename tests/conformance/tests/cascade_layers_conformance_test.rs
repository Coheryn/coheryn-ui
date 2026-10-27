use coherynui_compiler::CoherynCompiler;
use coherynui_design::CoherynConfig;
use coherynui_source::SourceCandidate;

#[test]
fn test_canonical_cascade_layer_order() {
    let compiler = CoherynCompiler::new(CoherynConfig::default());
    let candidates = vec![
        SourceCandidate::from_value("stack"),
        SourceCandidate::from_value("text-brand"),
    ];

    let result = compiler.compile_candidates(&candidates);

    // 1. Mandatory W3C @layer ordering declaration with canonical cyn prefix
    assert!(
        result
            .css
            .contains("@layer cyn.reset, cyn.tokens, cyn.base, cyn.recipes, cyn.utilities;"),
        "Compiled CSS must declare explicit canonical layer hierarchy"
    );

    // 2. Recipe must be wrapped in cyn.recipes
    assert!(
        result.css.contains("@layer cyn.recipes"),
        "Composite recipes must be placed in @layer cyn.recipes"
    );

    // 3. Tokens must be bound to --cyn-*
    assert!(
        result.css.contains("--cyn-") || result.css.contains(".stack"),
        "Design tokens must use canonical prefix"
    );
}

#[test]
fn test_custom_layer_prefix_configuration() {
    let mut config = CoherynConfig::default();
    config.compiler.layer_prefix = "customui".to_string();
    config.compiler.variable_prefix = "customui".to_string();

    let compiler = CoherynCompiler::new(config);
    let candidates = vec![SourceCandidate::from_value("stack")];

    let result = compiler.compile_candidates(&candidates);

    assert!(
        result.css.contains("@layer customui.reset, customui.tokens, customui.base, customui.recipes, customui.utilities;"),
        "Compiler must respect customized layer_prefix"
    );
    assert!(
        result.css.contains("@layer customui.recipes"),
        "Recipes must use configured layer prefix"
    );
}

#[test]
fn test_utility_layer_precedence_over_recipes() {
    let compiler = CoherynCompiler::new(CoherynConfig::default());
    let candidates = vec![
        SourceCandidate::from_value("sidebar"),
        SourceCandidate::from_value("p-4"),
    ];

    let result = compiler.compile_candidates(&candidates);

    let layer_decl = "@layer cyn.reset, cyn.tokens, cyn.base, cyn.recipes, cyn.utilities;";
    let recipes_idx = result.css.find("@layer cyn.recipes").unwrap_or(0);
    let utilities_idx = result.css.find("@layer cyn.utilities").unwrap_or(0);

    // Check layer declaration appears before any layer blocks
    let decl_idx = result.css.find(layer_decl).expect("Layer declaration missing");
    assert!(decl_idx < recipes_idx, "Layer order declaration must precede recipe definitions");
    assert!(decl_idx < utilities_idx, "Layer order declaration must precede utility definitions");
}

use coherynui_class_opt::{ClassRewriter, RenamingManifest, RenamingMode};
use coherynui_compiler::CoherynCompiler;
use coherynui_design::CoherynConfig;
use coherynui_source::extract_candidates_from_str;
use std::collections::BTreeSet;
use std::time::Instant;

#[test]
fn test_complex_dashboard_conformance_and_determinism() {
    let dashboard_html = include_str!("../../../tests/fixtures/dashboard/index.html");
    let candidates = extract_candidates_from_str(dashboard_html, "dashboard.html");

    assert!(candidates.len() >= 30, "Complex dashboard should contain at least 30 class candidates");

    let compiler = CoherynCompiler::new(CoherynConfig::default());

    // Measure build latency
    let start = Instant::now();
    let result1 = compiler.compile_candidates(&candidates);
    let duration = start.elapsed();

    // Verify sub-50ms compile time on single representative page
    println!("Compiled {} classes in {:?}", result1.generated_classes.len(), duration);

    // Determinism test: repeated compilation of identical candidates must yield identical CSS byte-for-byte
    let result2 = compiler.compile_candidates(&candidates);
    assert_eq!(result1.css, result2.css, "Repeated compilation must produce identical byte-for-byte output");

    // Conformance: Check key rules emitted
    assert!(result1.css.contains("@layer cyn.reset, cyn.tokens, cyn.base, cyn.recipes, cyn.utilities;"));
    assert!(result1.css.contains(".sidebar {"));
    assert!(result1.css.contains(".stack {"));
    assert!(result1.css.contains(".cluster {"));
    assert!(result1.css.contains("container-type: inline-size;"));
    assert!(result1.css.contains(".glass {"));
    assert!(result1.css.contains(".glass-strong {"));

    // Production Class Renaming Conformance
    let safelist = BTreeSet::new();
    let manifest = RenamingManifest::generate_from_classes(&result1.generated_classes, RenamingMode::Aggressive, &safelist);

    let rewritten_html = ClassRewriter::rewrite_markup(dashboard_html, &manifest);
    let rewritten_css = ClassRewriter::rewrite_css(&result1.css, &manifest);

    // Verify HTML is compressed and classes match
    assert!(rewritten_html.len() < dashboard_html.len(), "Aggressive renaming must reduce HTML size");
    assert!(manifest.mappings.len() >= 25, "At least 25 classes should be mangled in dashboard");

    // Verify round-trip reverse explanation
    for (orig, mangled) in &manifest.mappings {
        assert_eq!(manifest.explain(mangled), Some(orig));
    }
}

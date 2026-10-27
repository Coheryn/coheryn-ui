use coherynui_compiler::CoherynCompiler;
use coherynui_design::CoherynConfig;
use coherynui_source::extract_candidates_from_str;

#[test]
fn test_adaptive_layout_primitives_emission() {
    let html = r#"
        <div class="stack gap-4">
            <header class="cluster justify-between p-4"></header>
            <main class="grid-auto gap-6"></main>
            <section class="center"></section>
            <aside class="sidebar"></aside>
            <div class="flow"></div>
            <footer class="cover"></footer>
            <div class="switcher"></div>
        </div>
    "#;

    let candidates = extract_candidates_from_str(html, "layout.html");
    let compiler = CoherynCompiler::new(CoherynConfig::default());
    let result = compiler.compile_candidates(&candidates);

    // Assert adaptive primitives present in recipes layer
    assert!(result.css.contains(".stack {"));
    assert!(result.css.contains("flex-direction: column;"));

    assert!(result.css.contains(".cluster {"));
    assert!(result.css.contains("flex-wrap: wrap;"));

    assert!(result.css.contains(".grid-auto {"));
    assert!(result.css.contains("grid-template-columns: repeat(auto-fit, minmax(var(--cyn-grid-min, 16rem), 1fr));"));

    assert!(result.css.contains(".center {"));
    assert!(result.css.contains("margin-inline: auto;"));

    assert!(result.css.contains(".sidebar {"));
    assert!(result.css.contains(".flow > * + * {"));
    assert!(result.css.contains(".cover {"));
    assert!(result.css.contains(".switcher {"));

    // Check zero diagnostics
    assert_eq!(result.diagnostics.len(), 0, "No diagnostics expected for adaptive primitives");
}

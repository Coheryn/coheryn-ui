use coherynui_compiler::CoherynCompiler;
use coherynui_design::CoherynConfig;
use coherynui_source::extract_candidates_from_str;

#[test]
fn test_container_queries_emission() {
    let html = r#"
        <section class="cq-root p-6">
            <div class="grid cols-1 cq:cols-2 cq-lg:cols-4 gap-4">
                <article class="p-4 radius-lg bg-surface"></article>
            </div>
        </section>
    "#;

    let candidates = extract_candidates_from_str(html, "cq_demo.html");
    let compiler = CoherynCompiler::new(CoherynConfig::default());
    let result = compiler.compile_candidates(&candidates);

    // Verify container-type declaration
    assert!(result.css.contains(".cq-root {"));
    assert!(result.css.contains("container-type: inline-size;"));

    // Verify container queries
    assert!(result.css.contains("@container (min-width: 320px) {"));
    assert!(result.css.contains("@container (min-width: 800px) {"));

    // Verify grid cols in container query
    assert!(result.css.contains("grid-template-columns: repeat(2, minmax(0, 1fr));"));
    assert!(result.css.contains("grid-template-columns: repeat(4, minmax(0, 1fr));"));

    assert_eq!(result.diagnostics.len(), 0);
}

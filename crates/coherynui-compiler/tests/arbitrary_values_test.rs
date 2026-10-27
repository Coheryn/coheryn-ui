use coherynui_compiler::CoherynCompiler;
use coherynui_design::CoherynConfig;
use coherynui_source::extract_candidates_from_str;

#[test]
fn test_arbitrary_values_emission() {
    let html = r#"
        <div class="p-[27px] m-[1.375rem] w-[calc(100%_-_2rem)] bg-[#172033] fg-[#f8fafc] radius-[14px]">
        </div>
    "#;

    let candidates = extract_candidates_from_str(html, "arbitrary.html");
    let compiler = CoherynCompiler::new(CoherynConfig::default());
    let result = compiler.compile_candidates(&candidates);

    // Verify escaped arbitrary selector and custom values
    assert!(result.css.contains(".p-\\[27px\\] {"));
    assert!(result.css.contains("padding: 27px;"));

    assert!(result.css.contains(".m-\\[1\\.375rem\\]") || result.css.contains("margin: 1.375rem;"));

    assert!(result.css.contains(".bg-\\[\\#172033\\] {"));
    assert!(result.css.contains("background-color: #172033;"));

    assert!(result.css.contains(".fg-\\[\\#f8fafc\\] {"));
    assert!(result.css.contains("color: #f8fafc;"));

    assert!(result.css.contains(".radius-\\[14px\\] {"));
    assert!(result.css.contains("border-radius: 14px;"));

    assert!(result.css.contains("width: calc(100% - 2rem);"));

    assert_eq!(result.diagnostics.len(), 0);
}

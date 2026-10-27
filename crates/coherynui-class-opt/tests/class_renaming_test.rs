use coherynui_class_opt::{ClassRewriter, RenamingError, RenamingManifest, RenamingMode};
use std::collections::BTreeSet;

#[test]
fn test_manifest_generation_and_safelist() {
    let mut classes = BTreeSet::new();
    classes.insert("flex".to_string());
    classes.insert("items-center".to_string());
    classes.insert("p-6".to_string());
    classes.insert("public-api-btn".to_string());

    let mut safelist = BTreeSet::new();
    safelist.insert("public-api-btn".to_string());

    let manifest = RenamingManifest::generate_from_classes(&classes, RenamingMode::Aggressive, &safelist);

    assert_eq!(manifest.mappings.len(), 3);
    assert!(manifest.lookup("flex").is_some());
    assert!(manifest.lookup("items-center").is_some());
    assert!(manifest.lookup("p-6").is_some());
    assert!(manifest.lookup("public-api-btn").is_none(), "Safelist class should not be mangled");

    // Test reverse explanation
    let mangled_flex = manifest.lookup("flex").unwrap();
    assert_eq!(manifest.explain(mangled_flex), Some(&"flex".to_string()));
}

#[test]
fn test_html_markup_and_css_rewriting() {
    let mut classes = BTreeSet::new();
    classes.insert("flex".to_string());
    classes.insert("items-center".to_string());
    classes.insert("p-6".to_string());

    let safelist = BTreeSet::new();
    let manifest = RenamingManifest::generate_from_classes(&classes, RenamingMode::Aggressive, &safelist);

    let html_input = r#"<div class="flex items-center p-6"><span class="unrecognized-static">Text</span></div>"#;
    let rewritten_html = ClassRewriter::rewrite_markup(html_input, &manifest);

    let mangled_flex = manifest.lookup("flex").unwrap();
    let mangled_items = manifest.lookup("items-center").unwrap();
    let mangled_p6 = manifest.lookup("p-6").unwrap();

    let expected_classes = format!("{} {} {}", mangled_flex, mangled_items, mangled_p6);
    assert!(rewritten_html.contains(&format!("class=\"{}\"", expected_classes)));
    assert!(rewritten_html.contains("class=\"unrecognized-static\""));

    let css_input = ".flex { display: flex; }\n.items-center { align-items: center; }\n.p-6 { padding: 1.5rem; }";
    let rewritten_css = ClassRewriter::rewrite_css(css_input, &manifest);

    assert!(rewritten_css.contains(&format!(".{} {{ display: flex; }}", mangled_flex)));
    assert!(rewritten_css.contains(&format!(".{} {{ align-items: center; }}", mangled_items)));
    assert!(rewritten_css.contains(&format!(".{} {{ padding: 1.5rem; }}", mangled_p6)));
}

#[test]
fn test_dynamic_class_fail_closed_verification() {
    let safelist = BTreeSet::new();
    let dynamic_jsx = r#"<div className={`btn-${variant}`} />"#;

    let result = ClassRewriter::verify_dynamic_safety(dynamic_jsx, &safelist);
    assert!(matches!(result, Err(RenamingError::UnsafeDynamicClass { .. })));

    let mut allowed_safelist = BTreeSet::new();
    allowed_safelist.insert("btn-".to_string());
    let allowed_result = ClassRewriter::verify_dynamic_safety(dynamic_jsx, &allowed_safelist);
    assert!(allowed_result.is_ok(), "Explicitly safelisted dynamic patterns should pass");
}

use coherynui_class_opt::{ClassRewriter, RenamingManifest, RenamingMode};
use std::collections::{BTreeSet, HashSet};

#[test]
fn test_class_optimizer_deterministic_mangling_and_collision_resistance() {
    let mut classes = BTreeSet::new();

    // Generate 1,000 simulated utility and component classes
    for i in 0..1000 {
        classes.insert(format!("utility-cls-token-{:04}", i));
    }

    let safelist = BTreeSet::new();
    let manifest = RenamingManifest::generate_from_classes(&classes, RenamingMode::Aggressive, &safelist);

    assert_eq!(
        manifest.mappings.len(),
        1000,
        "Every unique class must have an assigned mapping"
    );

    // Collision resistance check: All generated mangled identifiers must be unique
    let mut seen_mangled = HashSet::new();
    for (original, mangled) in &manifest.mappings {
        assert!(
            seen_mangled.insert(mangled.clone()),
            "Collision detected: mangled identifier '{}' assigned to multiple classes (including '{}')",
            mangled,
            original
        );
    }

    // Bi-directional reversibility check: manifest.explain must restore original class 100% of the time
    for (original, mangled) in &manifest.mappings {
        assert_eq!(
            manifest.explain(mangled),
            Some(original),
            "Reverse lookup must accurately reconstruct original class identifier"
        );
    }
}

#[test]
fn test_class_optimizer_safelist_preservation() {
    let mut classes = BTreeSet::new();
    classes.insert("btn-primary".to_string());
    classes.insert("keep-this-class".to_string());
    classes.insert("data-theme-selector".to_string());
    classes.insert("transient-internal-class".to_string());

    let mut safelist = BTreeSet::new();
    safelist.insert("keep-this-class".to_string());

    let manifest = RenamingManifest::generate_from_classes(&classes, RenamingMode::Aggressive, &safelist);

    // Safelisted class should not be mangled
    assert!(
        !manifest.mappings.contains_key("keep-this-class"),
        "Safelisted class must not be modified in renaming manifest"
    );

    // data-* classes are preserved by policy
    assert!(
        !manifest.mappings.contains_key("data-theme-selector"),
        "Attributes starting with data- must be preserved by default policy"
    );

    // Normal classes should be mangled
    assert!(
        manifest.mappings.contains_key("btn-primary"),
        "Unprotected class must be mangled"
    );
    assert!(
        manifest.mappings.contains_key("transient-internal-class"),
        "Unprotected class must be mangled"
    );
}

#[test]
fn test_class_rewriter_markup_and_css_roundtrip() {
    let mut classes = BTreeSet::new();
    classes.insert("hero-title".to_string());
    classes.insert("btn-deploy".to_string());

    let safelist = BTreeSet::new();
    let manifest = RenamingManifest::generate_from_classes(&classes, RenamingMode::Aggressive, &safelist);

    let html = r#"<div class="hero-title"><button class="btn-deploy">Deploy</button></div>"#;
    let rewritten_html = ClassRewriter::rewrite_markup(html, &manifest);

    let mangled_title = manifest.mappings.get("hero-title").unwrap();
    let mangled_btn = manifest.mappings.get("btn-deploy").unwrap();

    assert!(
        rewritten_html.contains(mangled_title),
        "Rewritten HTML must contain mangled hero title"
    );
    assert!(
        rewritten_html.contains(mangled_btn),
        "Rewritten HTML must contain mangled button class"
    );
    assert!(
        !rewritten_html.contains("hero-title"),
        "Original class must be substituted in production HTML"
    );

    let css = format!(".hero-title {{ color: red; }} .btn-deploy {{ padding: 10px; }}");
    let rewritten_css = ClassRewriter::rewrite_css(&css, &manifest);

    assert!(
        rewritten_css.contains(&format!(".{} {{", mangled_title)),
        "Rewritten CSS must match mangled selector"
    );
}

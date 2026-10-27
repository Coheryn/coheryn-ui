use coherynui_incremental::{BuildCache, CacheKey};

#[test]
fn test_cache_key_determinism() {
    let key1 = CacheKey::compute("0.1.0", b"theme = 'light'", b"class='flex items-center'");
    let key2 = CacheKey::compute("0.1.0", b"theme = 'light'", b"class='flex items-center'");
    let key_diff = CacheKey::compute("0.1.0", b"theme = 'dark'", b"class='flex items-center'");

    assert_eq!(key1, key2, "Identical inputs must yield identical blake3 cache keys");
    assert_ne!(key1, key_diff, "Config change must invalidate cache key");
}

#[test]
fn test_clean_build_cached_build_equivalence() {
    let mut cache = BuildCache::new("0.1.0", "cfg_hash_123");
    let file_path = "src/App.tsx".to_string();
    let file_content = b"<div class=\"flex p-6\"></div>";
    let file_hash = CacheKey::hash_bytes(file_content);

    // Initial clean build: insert entry
    cache.insert_entry(
        file_path.clone(),
        file_hash.clone(),
        vec!["flex".to_string(), "p-6".to_string()],
        Some(".flex { display: flex; }\n.p-6 { padding: 1.5rem; }".to_string()),
    );

    // Second build: check cache hit
    let cached = cache.get_valid_entry(&file_path, &file_hash);
    assert!(cached.is_some(), "Cache hit expected for identical file hash");

    let entry = cached.unwrap();
    assert_eq!(entry.extracted_classes, vec!["flex", "p-6"]);
    assert_eq!(
        entry.generated_css_chunk.as_deref(),
        Some(".flex { display: flex; }\n.p-6 { padding: 1.5rem; }")
    );

    // Modified file content: cache miss
    let mod_content = b"<div class=\"flex p-8\"></div>";
    let mod_hash = CacheKey::hash_bytes(mod_content);
    assert!(cache.get_valid_entry(&file_path, &mod_hash).is_none(), "Modified content must produce a cache miss");
}

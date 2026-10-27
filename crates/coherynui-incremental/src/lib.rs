//! CoherynUI CSS — Incremental Dependency Tracking and Build Cache
//!
//! Tracks file hashes, config hashes, and intermediate rules using blake3.
//! Guarantees: clean build ≡ cached build.

use coherynui_core::CssRule;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::Path;

/// Composite cache key derived from compiler version, configuration, and inputs.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct CacheKey(pub String);

impl CacheKey {
    pub fn compute(compiler_version: &str, config_bytes: &[u8], source_bytes: &[u8]) -> Self {
        let mut hasher = blake3::Hasher::new();
        hasher.update(b"coherynui-v1:");
        hasher.update(compiler_version.as_bytes());
        hasher.update(b":config:");
        hasher.update(config_bytes);
        hasher.update(b":source:");
        hasher.update(source_bytes);
        Self(hasher.finalize().to_hex().to_string())
    }

    pub fn hash_bytes(data: &[u8]) -> String {
        blake3::hash(data).to_hex().to_string()
    }
}

/// In-memory and serializable incremental build cache.
#[derive(Debug, Default, Clone, Serialize, Deserialize)]
pub struct BuildCache {
    pub compiler_version: String,
    pub config_hash: String,
    entries: HashMap<String, CachedEntry>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CachedEntry {
    pub file_hash: String,
    pub extracted_classes: Vec<String>,
    pub generated_css_chunk: Option<String>,
}

impl BuildCache {
    pub fn new(compiler_version: impl Into<String>, config_hash: impl Into<String>) -> Self {
        Self {
            compiler_version: compiler_version.into(),
            config_hash: config_hash.into(),
            entries: HashMap::new(),
        }
    }

    /// Check if cached entry is valid for a given file and file content hash.
    pub fn get_valid_entry(&self, file_path: &str, current_file_hash: &str) -> Option<&CachedEntry> {
        if let Some(entry) = self.entries.get(file_path) {
            if entry.file_hash == current_file_hash {
                return Some(entry);
            }
        }
        None
    }

    pub fn insert_entry(
        &mut self,
        file_path: String,
        file_hash: String,
        extracted_classes: Vec<String>,
        generated_css_chunk: Option<String>,
    ) {
        self.entries.insert(
            file_path,
            CachedEntry {
                file_hash,
                extracted_classes,
                generated_css_chunk,
            },
        );
    }

    pub fn is_config_valid(&self, current_config_hash: &str, current_compiler_version: &str) -> bool {
        self.config_hash == current_config_hash && self.compiler_version == current_compiler_version
    }

    pub fn save_to_file(&self, path: &Path) -> Result<(), std::io::Error> {
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)?;
        }
        let serialized = serde_json::to_string(self)?;
        fs::write(path, serialized)?;
        Ok(())
    }

    pub fn load_from_file(path: &Path) -> Option<Self> {
        if path.exists() {
            if let Ok(content) = fs::read_to_string(path) {
                if let Ok(cache) = serde_json::from_str(&content) {
                    return Some(cache);
                }
            }
        }
        None
    }

    pub fn clear(&mut self) {
        self.entries.clear();
    }
}

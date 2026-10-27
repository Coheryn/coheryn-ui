//! CoherynUI — Plugin Contract Interfaces and Capability Models
//!
//! Provides ABI definitions, capabilities, and data contracts for
//! sandboxed WebAssembly Component Model plugins.

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use thiserror::Error;

#[derive(Debug, Error, PartialEq, Eq)]
pub enum PluginApiError {
    #[error("Plugin manifest validation error: {0}")]
    InvalidManifest(String),
    #[error("Permission denied: {0}")]
    PermissionDenied(String),
}

/// Granular permissions granted to an isolated plugin.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PluginCapabilities {
    pub can_register_utilities: bool,
    pub can_register_variants: bool,
    pub can_read_tokens: bool,
    pub can_emit_diagnostics: bool,
}

impl Default for PluginCapabilities {
    fn default() -> Self {
        Self {
            can_register_utilities: true,
            can_register_variants: false,
            can_read_tokens: false,
            can_emit_diagnostics: true,
        }
    }
}

/// Metadata declared by a WebAssembly plugin.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PluginMetadata {
    pub id: String,
    pub name: String,
    pub version: String,
    pub author: Option<String>,
    pub description: Option<String>,
    pub requested_capabilities: PluginCapabilities,
}

/// Project-level plugin registration manifest (`coherynui.plugins.json`).
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct PluginManifest {
    pub schema_version: String,
    pub plugins: BTreeMap<String, InstalledPluginEntry>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct InstalledPluginEntry {
    pub path: String,
    pub hash: String,
    pub capabilities: PluginCapabilities,
}

impl PluginManifest {
    pub fn new() -> Self {
        Self {
            schema_version: "1.0".to_string(),
            plugins: BTreeMap::new(),
        }
    }

    pub fn to_json(&self) -> Result<String, serde_json::Error> {
        serde_json::to_string_pretty(self)
    }

    pub fn from_json(json: &str) -> Result<Self, serde_json::Error> {
        serde_json::from_str(json)
    }
}

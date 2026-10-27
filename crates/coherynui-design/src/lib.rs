//! CoherynUI CSS — Design Tokens, Theming, Recipes, and CSS Materials
//!
//! Provides typed token representations, TOML configuration parsing,
//! CSS custom properties generation, and Liquid Glass material presets.

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum DesignError {
    #[error("Failed to parse config: {0}")]
    ConfigParse(#[from] toml::de::Error),
    #[error("Missing token reference '{0}'")]
    MissingToken(String),
}

/// CoherynUI compiler and prefix configuration.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompilerConfig {
    /// Cascade layer namespace: default "cyn" -> `@layer cyn.reset, cyn.tokens...`
    #[serde(default = "default_layer_prefix")]
    pub layer_prefix: String,

    /// CSS custom properties prefix: default "cyn" -> `--cyn-color-surface`, `--cyn-radius-md`
    #[serde(default = "default_variable_prefix")]
    pub variable_prefix: String,

    /// Optional utility class prefix: default "" -> e.g. "cy-" produces `.cy-flex`, `.cy-p-4`
    #[serde(default)]
    pub class_prefix: String,
}

fn default_layer_prefix() -> String {
    "cyn".to_string()
}

fn default_variable_prefix() -> String {
    "cyn".to_string()
}

impl Default for CompilerConfig {
    fn default() -> Self {
        Self {
            layer_prefix: default_layer_prefix(),
            variable_prefix: default_variable_prefix(),
            class_prefix: String::new(),
        }
    }
}

/// CoherynUI project configuration (`coherynui.config.toml`).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CoherynConfig {
    #[serde(default)]
    pub compiler: CompilerConfig,
    #[serde(default = "default_theme_config")]
    pub theme: ThemeConfig,
    #[serde(default)]
    pub tokens: TokenCatalog,
    #[serde(default)]
    pub themes: BTreeMap<String, ThemeTokens>,
}

impl Default for CoherynConfig {
    fn default() -> Self {
        let mut config = Self {
            compiler: CompilerConfig::default(),
            theme: default_theme_config(),
            tokens: TokenCatalog::default(),
            themes: BTreeMap::new(),
        };

        let mut light_colors = BTreeMap::new();
        light_colors.insert("surface".to_string(), "#ffffff".to_string());
        light_colors.insert("foreground".to_string(), "#172033".to_string());
        light_colors.insert("brand".to_string(), "#3b82f6".to_string());

        let mut dark_colors = BTreeMap::new();
        dark_colors.insert("surface".to_string(), "#101827".to_string());
        dark_colors.insert("foreground".to_string(), "#f5f7fb".to_string());
        dark_colors.insert("brand".to_string(), "#60a5fa".to_string());

        config.themes.insert("light".to_string(), ThemeTokens { colors: light_colors });
        config.themes.insert("dark".to_string(), ThemeTokens { colors: dark_colors });

        config
    }
}

fn default_theme_config() -> ThemeConfig {
    ThemeConfig {
        default: "light".to_string(),
        available: vec!["light".to_string(), "dark".to_string()],
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ThemeConfig {
    pub default: String,
    pub available: Vec<String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct TokenCatalog {
    #[serde(default)]
    pub radius: BTreeMap<String, String>,
    #[serde(default)]
    pub spacing: BTreeMap<String, String>,
    #[serde(default)]
    pub typography: BTreeMap<String, String>,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct ThemeTokens {
    #[serde(default)]
    pub colors: BTreeMap<String, String>,
}

impl CoherynConfig {
    pub fn parse(toml_content: &str) -> Result<Self, DesignError> {
        let config: Self = toml::from_str(toml_content)?;
        Ok(config)
    }

    /// Emits CSS custom properties for `:root` and `[data-theme="..."]`.
    pub fn emit_css_tokens(&self) -> String {
        let mut out = String::new();
        let p = &self.compiler.variable_prefix;
        out.push_str("/* CoherynUI Design Tokens */\n:root {\n");

        // Emit spacing
        for (k, v) in &self.tokens.spacing {
            out.push_str(&format!("  --{}-space-{}: {};\n", p, k, v));
        }
        // Emit radius
        for (k, v) in &self.tokens.radius {
            out.push_str(&format!("  --{}-radius-{}: {};\n", p, k, v));
        }

        // Emit default theme colors
        if let Some(default_theme) = self.themes.get(&self.theme.default) {
            for (k, v) in &default_theme.colors {
                out.push_str(&format!("  --{}-color-{}: {};\n", p, k, v));
            }
        }
        out.push_str("}\n\n");

        // Emit explicit theme overrides
        for (name, theme) in &self.themes {
            out.push_str(&format!("[data-theme=\"{}\"] {{\n", name));
            for (k, v) in &theme.colors {
                out.push_str(&format!("  --{}-color-{}: {};\n", p, k, v));
            }
            out.push_str("}\n\n");
        }

        out
    }

    /// Generates Liquid Glass CSS-native material styles with fallbacks using configured prefixes.
    pub fn emit_liquid_glass_css(&self) -> String {
        Self::emit_liquid_glass_css_with_prefixes(&self.compiler.layer_prefix, &self.compiler.variable_prefix)
    }

    /// Generates Liquid Glass CSS-native material styles with explicit layer and variable prefixes.
    pub fn emit_liquid_glass_css_with_prefixes(layer: &str, p: &str) -> String {
        format!(
r#"/* CoherynUI CSS — Liquid Glass Material Recipes (Tier 1 Fallbacks & Tier 2 Enhanced) */
@layer {layer}.recipes {{
  .glass {{
    --{p}-glass-bg: rgba(255, 255, 255, 0.7);
    --{p}-glass-border: rgba(255, 255, 255, 0.25);
    --{p}-glass-blur: 16px;
    --{p}-glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.08);
    background: var(--{p}-glass-bg);
    border: 1px solid var(--{p}-glass-border);
    box-shadow: var(--{p}-glass-shadow);
  }}

  [data-theme="dark"] .glass {{
    --{p}-glass-bg: rgba(16, 24, 39, 0.75);
    --{p}-glass-border: rgba(255, 255, 255, 0.1);
    --{p}-glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.35);
  }}

  @supports (backdrop-filter: blur(1px)) {{
    .glass {{
      backdrop-filter: blur(var(--{p}-glass-blur));
      -webkit-backdrop-filter: blur(var(--{p}-glass-blur));
    }}
  }}

  @media (prefers-reduced-transparency: reduce) {{
    .glass {{
      background: var(--{p}-color-surface, #ffffff);
      backdrop-filter: none;
      -webkit-backdrop-filter: none;
    }}
    [data-theme="dark"] .glass {{
      background: var(--{p}-color-surface, #101827);
    }}
  }}

  .glass-strong {{
    --{p}-glass-bg: rgba(255, 255, 255, 0.85);
    --{p}-glass-blur: 24px;
  }}
  [data-theme="dark"] .glass-strong {{
    --{p}-glass-bg: rgba(16, 24, 39, 0.88);
  }}

  .glass-edge {{
    box-shadow: inset 0 1px 1px 0 rgba(255, 255, 255, 0.4), var(--{p}-glass-shadow);
  }}
}}
"#)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_custom_prefixes_in_config() {
        let toml_str = r#"
[compiler]
layer_prefix = "acme"
variable_prefix = "acme"
class_prefix = "ui-"

[theme]
default = "dark"
available = ["dark"]

[themes.dark.colors]
surface = "#000000"
"#;
        let config = CoherynConfig::parse(toml_str).expect("Valid config");
        assert_eq!(config.compiler.layer_prefix, "acme");
        assert_eq!(config.compiler.variable_prefix, "acme");
        assert_eq!(config.compiler.class_prefix, "ui-");

        let tokens = config.emit_css_tokens();
        assert!(tokens.contains("--acme-color-surface: #000000;"));

        let glass = config.emit_liquid_glass_css();
        assert!(glass.contains("@layer acme.recipes {"));
        assert!(glass.contains("--acme-glass-blur: 16px;"));
    }
}

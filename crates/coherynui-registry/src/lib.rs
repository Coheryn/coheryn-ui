//! CoherynUI Component & Recipe Registry
//!
//! Exposes machine-readable, intent-searchable metadata, accessibility contracts,
//! and tested examples for all CoherynUI components and design recipes.

use serde::{Deserialize, Serialize};
use std::collections::BTreeMap;

pub const REGISTRY_SCHEMA_VERSION: &str = "1.0";

/// Canonical component definition in the machine-readable registry.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComponentEntry {
    pub schema_version: String,
    pub id: String,
    pub name: String,
    pub category: String,
    pub framework: String,
    pub package: String,
    pub description: String,
    pub capabilities: Vec<String>,
    pub dependencies: Vec<String>,
    pub props: BTreeMap<String, PropDefinition>,
    pub accessibility: AccessibilityContract,
    pub examples: Vec<String>,
    pub introduced_in: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PropDefinition {
    pub prop_type: String,
    pub required: bool,
    pub default: Option<String>,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccessibilityContract {
    pub role: String,
    pub keyboard_navigation: Vec<String>,
    pub focus_management: String,
    pub aria_attributes: Vec<String>,
}

/// Canonical recipe definition (layouts, materials, glass).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RecipeEntry {
    pub id: String,
    pub name: String,
    pub category: String,
    pub description: String,
    pub css_declarations: String,
    pub variants: Vec<String>,
    pub fallback: Option<String>,
}

/// The complete machine-readable registry index.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RegistryIndex {
    pub schema_version: String,
    pub coheryn_version: String,
    pub components: Vec<ComponentEntry>,
    pub recipes: Vec<RecipeEntry>,
}

impl Default for RegistryIndex {
    fn default() -> Self {
        Self::load_canonical()
    }
}

impl RegistryIndex {
    /// Loads the canonical, verified Stable 1.0 registry entries.
    pub fn load_canonical() -> Self {
        let mut components = Vec::new();
        let mut recipes = Vec::new();

        // 1. Button
        let mut btn_props = BTreeMap::new();
        btn_props.insert(
            "variant".into(),
            PropDefinition {
                prop_type: "'primary' | 'secondary' | 'danger' | 'ghost'".into(),
                required: false,
                default: Some("'primary'".into()),
                description: "Visual surface style variant".into(),
            },
        );
        btn_props.insert(
            "disabled".into(),
            PropDefinition {
                prop_type: "boolean".into(),
                required: false,
                default: Some("false".into()),
                description: "Disables interaction and manages aria-disabled".into(),
            },
        );

        components.push(ComponentEntry {
            schema_version: REGISTRY_SCHEMA_VERSION.into(),
            id: "component:button".into(),
            name: "Button".into(),
            category: "inputs".into(),
            framework: "react".into(),
            package: "@coherynui/react".into(),
            description: "Interactive accessible button element with keyboard activation and specular hover states".into(),
            capabilities: vec!["keyboard-activation".into(), "high-contrast-focus".into()],
            dependencies: vec!["@coherynui/react".into(), "@coherynui/components".into()],
            props: btn_props,
            accessibility: AccessibilityContract {
                role: "button".into(),
                keyboard_navigation: vec!["Enter (activate)".into(), "Space (activate)".into()],
                focus_management: "Native focus with visible 2px offset outline".into(),
                aria_attributes: vec!["aria-disabled".into(), "aria-busy".into()],
            },
            examples: vec![
                "<Button variant=\"primary\">Deploy Module</Button>".into(),
                "<Button variant=\"secondary\" disabled>Pending</Button>".into(),
            ],
            introduced_in: "1.0.0".into(),
        });

        // 2. Dialog (Modal)
        let mut dialog_props = BTreeMap::new();
        dialog_props.insert(
            "open".into(),
            PropDefinition {
                prop_type: "boolean".into(),
                required: true,
                default: None,
                description: "Controls open state of the modal dialog".into(),
            },
        );
        dialog_props.insert(
            "onClose".into(),
            PropDefinition {
                prop_type: "() => void".into(),
                required: true,
                default: None,
                description: "Callback invoked on dismiss (Escape key or backdrop click)".into(),
            },
        );

        components.push(ComponentEntry {
            schema_version: REGISTRY_SCHEMA_VERSION.into(),
            id: "component:dialog".into(),
            name: "Dialog".into(),
            category: "overlay".into(),
            framework: "react".into(),
            package: "@coherynui/react".into(),
            description: "WAI-ARIA modal dialog featuring strict focus trapping, escape dismissal, and background scroll locking".into(),
            capabilities: vec!["focus-trap".into(), "dismiss-on-escape".into(), "scroll-lock".into()],
            dependencies: vec!["@coherynui/react".into(), "@coherynui/components".into()],
            props: dialog_props,
            accessibility: AccessibilityContract {
                role: "dialog".into(),
                keyboard_navigation: vec!["Tab / Shift+Tab (trapped within dialog)".into(), "Escape (dismiss)".into()],
                focus_management: "Initial focus to first interactive child; restored to invoker on dismiss".into(),
                aria_attributes: vec!["aria-modal=\"true\"".into(), "aria-labelledby".into(), "aria-describedby".into()],
            },
            examples: vec![
                "<Dialog open={isOpen} onClose={() => setIsOpen(false)} title=\"Confirm Release\">...</Dialog>".into(),
            ],
            introduced_in: "1.0.0".into(),
        });

        // 3. GlassCard
        let mut glass_props = BTreeMap::new();
        glass_props.insert(
            "tier".into(),
            PropDefinition {
                prop_type: "'css' | 'gpu'".into(),
                required: false,
                default: Some("'css'".into()),
                description: "Rendering tier: CSS native backdrop blur or WebGPU optical refraction".into(),
            },
        );

        components.push(ComponentEntry {
            schema_version: REGISTRY_SCHEMA_VERSION.into(),
            id: "component:glass-card".into(),
            name: "GlassCard".into(),
            category: "surfaces".into(),
            framework: "react".into(),
            package: "@coherynui/react".into(),
            description: "Liquid Glass surface container with specular border highlights and automatic reduced-transparency fallback".into(),
            capabilities: vec!["liquid-glass".into(), "reduced-transparency-fallback".into()],
            dependencies: vec!["@coherynui/react".into()],
            props: glass_props,
            accessibility: AccessibilityContract {
                role: "region".into(),
                keyboard_navigation: vec!["Inherits child focus".into()],
                focus_management: "Preserves internal element tab order".into(),
                aria_attributes: vec!["aria-label".into()],
            },
            examples: vec![
                "<GlassCard tier=\"css\" className=\"p-6\"><h3>Telemetry</h3></GlassCard>".into(),
            ],
            introduced_in: "1.0.0".into(),
        });

        // 4. Tabs
        let mut tabs_props = BTreeMap::new();
        tabs_props.insert(
            "activeTab".into(),
            PropDefinition {
                prop_type: "string".into(),
                required: true,
                default: None,
                description: "Active tab identifier".into(),
            },
        );

        components.push(ComponentEntry {
            schema_version: REGISTRY_SCHEMA_VERSION.into(),
            id: "component:tabs".into(),
            name: "Tabs".into(),
            category: "navigation".into(),
            framework: "react".into(),
            package: "@coherynui/react".into(),
            description: "WAI-ARIA tabs with horizontal roving tabindex and arrow-key focus delegation".into(),
            capabilities: vec!["roving-focus".into(), "keyboard-navigation".into()],
            dependencies: vec!["@coherynui/react".into(), "@coherynui/components".into()],
            props: tabs_props,
            accessibility: AccessibilityContract {
                role: "tablist".into(),
                keyboard_navigation: vec!["ArrowRight / ArrowLeft (roving navigation)".into(), "Home / End (boundary jump)".into()],
                focus_management: "Roving tabindex: active tab is 0, inactive are -1".into(),
                aria_attributes: vec!["role=\"tab\"".into(), "aria-selected".into(), "aria-controls".into()],
            },
            examples: vec![
                "<Tabs items={tabList} activeId={tab} onChange={setTab} />".into(),
            ],
            introduced_in: "1.0.0".into(),
        });

        // Add canonical Recipes
        recipes.push(RecipeEntry {
            id: "recipe:stack".into(),
            name: "stack".into(),
            category: "adaptive-layout".into(),
            description: "Vertical flex column primitive with natural flow separation".into(),
            css_declarations: "display: flex; flex-direction: column; justify-content: flex-start;".into(),
            variants: vec!["gap-2".into(), "gap-4".into(), "gap-6".into()],
            fallback: None,
        });

        recipes.push(RecipeEntry {
            id: "recipe:sidebar".into(),
            name: "sidebar".into(),
            category: "adaptive-layout".into(),
            description: "Adaptive sidebar layout that wraps cleanly when viewport falls below threshold".into(),
            css_declarations: "display: flex; flex-wrap: wrap; gap: var(--cyn-sidebar-gap, 1rem);".into(),
            variants: vec!["w-64".into(), "w-72".into()],
            fallback: None,
        });

        recipes.push(RecipeEntry {
            id: "recipe:glass".into(),
            name: "glass".into(),
            category: "materials".into(),
            description: "Tier 1 Liquid Glass surface with backdrop blur, subtle border, and dark mode tinting".into(),
            css_declarations: "background: var(--cyn-glass-bg); border: 1px solid var(--cyn-glass-border); backdrop-filter: blur(var(--cyn-glass-blur));".into(),
            variants: vec!["glass-strong".into(), "glass-edge".into()],
            fallback: Some("Opaque solid surface on prefers-reduced-transparency".into()),
        });

        Self {
            schema_version: REGISTRY_SCHEMA_VERSION.into(),
            coheryn_version: "1.0.0".into(),
            components,
            recipes,
        }
    }

    /// Search components by semantic intent (e.g. "accessible modal", "navigation sidebar", "glass button").
    pub fn search_components(&self, query: &str) -> Vec<&ComponentEntry> {
        let q = query.to_lowercase();
        self.components
            .iter()
            .filter(|c| {
                c.name.to_lowercase().contains(&q)
                    || c.category.to_lowercase().contains(&q)
                    || c.description.to_lowercase().contains(&q)
                    || c.capabilities.iter().any(|cap| cap.contains(&q))
                    || (q.contains("modal") && c.name == "Dialog")
                    || (q.contains("window") && c.name == "Dialog")
                    || (q.contains("glass") && c.capabilities.iter().any(|cap| cap.contains("glass")))
            })
            .collect()
    }

    /// Search recipes by name or description.
    pub fn search_recipes(&self, query: &str) -> Vec<&RecipeEntry> {
        let q = query.to_lowercase();
        self.recipes
            .iter()
            .filter(|r| r.name.to_lowercase().contains(&q) || r.description.to_lowercase().contains(&q) || r.category.to_lowercase().contains(&q))
            .collect()
    }

    /// Find component by exact ID.
    pub fn get_component(&self, id: &str) -> Option<&ComponentEntry> {
        self.components.iter().find(|c| c.id == id || c.name.eq_ignore_ascii_case(id))
    }
}

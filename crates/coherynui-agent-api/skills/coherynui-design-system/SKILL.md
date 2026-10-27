---
name: coherynui-design-system
description: Configure tokens, themes, semantic recipes, and design system invariants in coherynui.config.toml.
---

# CoherynUI Design System Workflow

This skill explains how to structure design tokens, custom prefixes, and theme palettes in CoherynUI.

## 1. Project Configuration (`coherynui.config.toml`)
```toml
[compiler]
layer_prefix = "cyn"       # Scopes @layer cyn.reset, cyn.tokens, cyn.recipes, cyn.utilities
variable_prefix = "cyn"    # Scopes CSS variables: --cyn-color-surface, --cyn-space-4
class_prefix = ""         # Optional utility class prefix (e.g. "ui-")

[theme]
default = "light"
available = ["light", "dark"]

[tokens.radius]
sm = "0.375rem"
md = "0.5rem"
lg = "0.75rem"
xl = "1rem"

[themes.light.colors]
surface = "#ffffff"
foreground = "#172033"
brand = "#3b82f6"

[themes.dark.colors]
surface = "#101827"
foreground = "#f5f7fb"
brand = "#60a5fa"
```

## 2. Using Tokens in CSS & Markup
- Spacing: `.p-4` -> `padding: 1rem` (or `var(--cyn-space-4)`)
- Radius: `.radius-xl` -> `border-radius: 1rem` (or `var(--cyn-radius-xl)`)
- Theme Colors: `.bg-surface` -> `background-color: var(--cyn-color-surface)`
- Brand Foreground: `.fg-primary` -> `color: var(--cyn-color-foreground)`

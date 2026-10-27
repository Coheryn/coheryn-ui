# CoherynUI Multi-Theme Application Starter

Production-ready multi-theme architecture starter built with CoherynUI, featuring dynamic runtime switching across 4 high-contrast and atmospheric palettes (`dark`, `light`, `cyberpunk`, `nord`).

## Highlights
- **Canonical Prefix**: Configured with the default `cyn` layer and variable prefix (`@layer cyn.*`, `--cyn-*`).
- **Zero-Latency Theme Switching**: Runtime theme selection powered by CSS custom properties and scoped attributes `[data-theme="..."]`.
- **Theme Palette Suite**:
  - `dark`: Deep slate with vibrant indigo brand accents.
  - `light`: Clean paper-white surfaces with high-contrast slate text.
  - `cyberpunk`: Pitch-black obsidian with glowing neon magenta and cyan highlights.
  - `nord`: Arctic polar night with serene frost blue tones.
- **Customizable Engine**: Easily map custom themes in `coherynui.config.toml` without touching existing component recipes.

## Quick Start
```bash
# Build the CSS bundle
coherynui build --input . --output coherynui.css

# Run development watcher
coherynui dev

# Verify token and accessibility contracts
coherynui check
```

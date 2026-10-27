# CoherynUI — Official Examples Gallery

Welcome to the **CoherynUI** examples catalog. These standalone examples demonstrate the complete capabilities of the CoherynUI CSS Engine, CoherynUI Components, CoherynUI Motion, and GPU Materials.

---

## Catalog of Examples

| Directory | Name & Theme | Key Features Demonstrated |
|---|---|---|
| **[01-landing-page/](./01-landing-page/index.html)** | **Modern Next-Gen SaaS Landing Page** | Liquid Glass navigation dock, gradient hero typography, adaptive feature grid, interactive theme switcher (`light`/`dark`). |
| **[02-admin-dashboard/](./02-admin-dashboard/index.html)** | **Cloud Infrastructure Analytics Dashboard** | Adaptive `sidebar` layout, container query metric cards (`cq:`), edge deployment data table with status badges, accessible modal. |
| **[03-liquid-glass-showcase/](./03-liquid-glass-showcase/index.html)** | **Liquid Glass & WebGPU Refraction Showcase** | Tier 1 CSS glass surfaces, Tier 2 frosted highlights, Tier 3 WebGPU shader refraction canvas with interactive pointer ripples. |
| **[04-motion-playground/](./04-motion-playground/index.html)** | **Interactive Motion & Spring Physics Lab** | Analytical spring solver with live stiffness/damping tuning, FLIP layout grid reordering, and timeline sequence animations. |
| **[05-accessible-components/](./05-accessible-components/index.html)** | **Complete Accessible UI Component Suite** | Focus-trapped Dialogs, Roving Tabindex Tabs, Switches, Form validation inputs, Badges, Accordions, and Spinners. |
| **[06-production-renaming/](./06-production-renaming/index.html)** | **Aggressive Class Renaming Demonstration** | Demonstrates before-and-after production minification, AST class rewriting, and bidirectional `coherynui.manifest.json` verification. |
| **[07-complete-ui-showcase/](./07-complete-ui-showcase/index.html)** | **All-Inclusive Interactive UI Showcase** | Comprehensive demonstration of Modals, Drawers, BottomSheets, Popovers, Dropdowns, Toast Notifications, Haptics, and Touch Ergonomics. |

---

## Running Examples Locally

You can open any `index.html` file directly in a web browser, or serve them locally with any static web server:

```bash
# Using Python
python3 -m http.server 3000

# Using Node / npx
npx serve examples/
```

To recompile stylesheets with the native CLI:
```bash
coherynui build --input examples/01-landing-page --output examples/01-landing-page/coherynui.css
```

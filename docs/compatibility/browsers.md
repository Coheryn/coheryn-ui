# CoherynUI — Browser Compatibility & Target Profiles v1.0

**Status:** Approved Specification  
**Authority:** [CoherynUI CSS Engineering Master Plan v1.1](../../resources/Coheryn_CSS_Engineering_Master_Plan_v1.1.md) — Section 13  
**Amendment:** [CoherynUI v1.2 Amendment (COH-AMD-1.2)](../../resources/Coheryn_UI_Amendment_v1.2.md)  
**Reference ADR:** [ADR-010: Browser-Target Profiles and Fallback Strategy](../../rfcs/0010-browser-target-profiles.md)

---

## 1. Browser Target Profiles

CoherynUI generates standards-based CSS and client enhancements configured across three explicit target profiles:

| Profile | Supported Baseline | Description |
|---|---|---|
| **`modern`** (Default) | Chrome 105+, Firefox 110+, Safari 16.4+, Edge 105+ | Emits native `@layer`, native CSS Container Queries (`@container`), CSS nesting, and modern color functions (`oklch()`). |
| **`compatible`** | Chrome 90+, Firefox 88+, Safari 14.1+, Edge 90+ | Transpiles `@layer` declarations to flat specificity rules; falls back container queries to viewport `@media` approximations. |
| **`experimental`** | Latest Canary / Technology Preview | Opt-in features: CSS Anchor Positioning, View Transitions Level 2, and WebGPU WGSL compute extensions. |

---

## 2. Modern Feature Support Matrix & Fallback Behavior

| Modern CSS Feature | Evergreen Support | CoherynUI CSS Engine Fallback Strategy |
|---|:---:|---|
| **Cascade Layers (`@layer`)** | Chrome 99+, FF 97+, Safari 15.4+ | Core architectural baseline. In `compatible` profile, layer wrappers are flattened in declared priority order. |
| **Container Queries (`cq-root`, `cq:`)** | Chrome 105+, FF 110+, Safari 16.0+ | Gracefully falls back to nearest viewport breakpoint when `@container` is unsupported. |
| **Backdrop Filter (`glass`)** | Chrome 76+, FF 103+, Safari 9.0+ | `@supports (backdrop-filter: blur(...))` guards filter. Fallback: semi-translucent or solid tinted `--cyn-color-surface`. |
| **Reduced Transparency** | `prefers-reduced-transparency` | Automatically renders solid opaque surfaces to guarantee contrast and readability. |
| **Reduced Motion** | `prefers-reduced-motion` | Immediately resolves animation controllers to destination state without intermediate physics ticks. |
| **WebGPU Optical Refraction** | Chrome 113+, Edge 113+, Safari 18+ (macOS/iOS) | Automatic runtime 3-tier cascade: WebGPU (WGSL) → WebGL2 (GLSL) → CSS Liquid Glass (`backdrop-filter`). |

---

## 3. High Contrast & Forced Colors

CoherynUI natively supports Windows High Contrast Mode and `forced-colors: active`:
- Transparent borders are rendered with `border: 1px solid CanvasText` in forced-colors mode.
- Focus rings utilize `outline: 2px solid Highlight` ensuring focus indicators remain visible regardless of background shader distortion.

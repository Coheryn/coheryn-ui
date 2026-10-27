<p align="center">
  <img src="assets/CoherynTech_Icon_Master_Gradient.svg" width="80" height="80" alt="CoherynTech Logo">
</p>

# CoherynUI — Documentation & Interactive Playground

**Release Target:** Stable 1.0  
**Canonical Prefix:** `cyn` (`@layer cyn.*`, `--cyn-*`)  
**Authority:** [COH-AMD-1.3](../resources/Coheryn_UI_Amendment_v1.3.md)

---

## 1. Interactive Playground

An interactive, zero-dependency browser playground is available directly at [`docs/index.html`](./index.html).

### Features
- **Live Token Inspector**: Tweak `--cyn-color-brand`, border radius, glass blur, and shadows with real-time cascade updates.
- **Theme Switcher**: Instant switching between `dark`, `light`, `cyberpunk`, and `nord` color profiles.
- **Component Workbench**: Test WAI-ARIA accessible primitives including focus-trapped dialogs and roving tabindex tabs.
- **Motion Physics Solver**: Real-time analytical harmonic spring simulation ($m \cdot x'' + c \cdot x' + k \cdot x = 0$) with damping ratio calculation.
- **GPU Materials & Liquid Glass**: 3-tier optical refraction simulation with CSS fallback toggle.
- **Agent Integration Portal**: Inspect MCP server tools and link directly to `/llms.txt` and `/llms-full.txt`.

To open locally:
```bash
# Open in default browser
open docs/index.html
```

---

## 2. Documentation Architecture

| Section | Path | Purpose |
|---|---|---|
| **Specification** | [`docs/spec/`](./spec/) | Grammar, IR syntax, and `@layer cyn.*` cascade rules |
| **Components** | [`docs/ui/`](./ui/) | Accessibility contracts, keyboard navigation, and ARIA attributes |
| **Motion Engine** | [`docs/motion/`](./motion/) | Harmonic spring solver, FLIP transitions, and keyframe sequencer |
| **GPU Materials** | [`docs/gpu/`](./gpu/) | WebGPU WGSL shaders, WebGL2 fallback, and CSS Liquid Glass |
| **Wasm Plugins** | [`docs/plugins/`](./plugins/) | WIT interface, sandboxed Component Model, and fuel metering |
| **Agent Guide** | [`docs/agent-guide/`](./agent-guide/) | Guidelines and tool usage for AI coding assistants |
| **Browser Support** | [`docs/compatibility/`](./compatibility/) | Compatibility matrix across Chromium, Gecko, and WebKit |

---

## 3. LLM & Frontier Agent References

- High-level overview: [`llms.txt`](../llms.txt)
- Comprehensive 1M+ token reference: [`llms-full.txt`](../llms-full.txt)
- Component & recipe registry: [`registry/index.json`](../registry/index.json)

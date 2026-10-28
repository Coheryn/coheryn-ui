# CoherynUI — Official Starter Templates

**Authority:** [CoherynUI v1.3 Amendment (COH-AMD-1.3)](../resources/Coheryn_UI_Amendment_v1.3.md) — Section 8.2  

This directory contains six production-grade, build-tested starter templates designed for rapid scaffolding by human developers and coding agents.

---

## Catalog of Templates

| Template | Scope & Demonstrated Features | Primary Recipe & Primitives |
|---|---|---|
| **[react-vite/](./react-vite/)** | Modern React + Vite SPA, @coheryn/coherynui-vite-plugin, HMR, touch BottomSheet | `@coheryn/coherynui-react`, `@coheryn/coherynui-motion`, `BottomSheet` |
| **[nextjs/](./nextjs/)** | Next.js 14/15 App Router, zero-FOUC server-safe cascade layers | Next.js App Router, `@coheryn/coherynui-react` |
| **[saas-dashboard/](./saas-dashboard/)** | Server telemetry, edge node monitoring, responsive sidebar navigation | `sidebar`, `cluster`, `cq:card` |
| **[admin-app/](./admin-app/)** | Data tables, form validation, focus-trapped dialogs, roving tabs | `Dialog`, `Tabs`, `Table` |
| **[marketing-landing/](./marketing-landing/)** | Gradient hero typography, floating Liquid Glass dock, adaptive grid | `glass`, `stack`, `switcher` |
| **[liquid-glass-showcase/](./liquid-glass-showcase/)** | 3-tier optical glass hierarchy with WebGPU shader fallback | `glass`, `glass-strong`, `glass-edge` |
| **[motion-showcase/](./motion-showcase/)** | Analytical spring solver, FLIP transitions, timeline sequencer | `SpringSolver`, `FlipTransition` |
| **[multi-theme-app/](./multi-theme-app/)** | Scoped theme palettes (`data-theme="dark"` / `"light"`), token custom properties | `--cyn-color-*`, `--cyn-space-*` |

---

## Scaffolding a Template
You can copy any template directory into a new project or compile it directly with `coherynui`:
```bash
coherynui build --input templates/saas-dashboard --output templates/saas-dashboard/coherynui.css
```

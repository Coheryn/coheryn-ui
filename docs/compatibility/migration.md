# CoherynUI — Migration & Compatibility Guide v1.0

**Status:** Approved Documentation  
**Authority:** [CoherynUI CSS Engineering Master Plan v1.1](../../resources/Coheryn_CSS_Engineering_Master_Plan_v1.1.md) — Section 2.3  
**Amendment:** [CoherynUI v1.2 Amendment (COH-AMD-1.2)](../../resources/Coheryn_UI_Amendment_v1.2.md)  

---

## 1. Migration Philosophy

Migration from legacy utility frameworks is designed as an onboarding tool, ensuring zero friction while preserving clean semantic architecture. 

To prevent accidental code corruption, migration tooling operates under a **dry-run and patch generation model**:
```bash
coherynui migrate --from legacy-css --dry-run
```
The command analyzes project sources, flags ambiguities, and emits a structured git patch or diff report rather than silently overwriting source files.

---

## 2. Key Conceptual & Naming Differences

| Category | Legacy Utility Paradigm | CoherynUI Canonical Paradigm | Rationale |
|---|---|---|---|
| **Text Color** | `text-slate-900` | `fg-primary` / `fg-muted` | Decouples color intent from raw scale names. Distinct from font size (`text-lg`). |
| **Font Size** | `text-xl` | `text-xl` | Preserves familiar scale for font sizing. |
| **Font Weight** | `font-bold` | `weight-bold` | Aligns directly with CSS `font-weight`. |
| **Border Radius** | `rounded-xl` | `radius-xl` | Aligns with CSS `border-radius` and token catalog (`[tokens.radius]`). |
| **Materials** | `bg-white/50 backdrop-blur-md` | `glass` / `glass-strong` | Multi-declaration recipe with automatic high-contrast opaque fallbacks and WebGPU hooks. |
| **Container Queries** | `@container`, `@lg:grid-cols-2` | `cq-root`, `cq-lg:cols-2` | Explicit containment roots and predictable container query threshold variants. |
| **Adaptive Layouts** | Ad-hoc flex/grid chains | `stack`, `cluster`, `grid-auto`, `sidebar` | Intrinsic CSS recipes that handle common layout topologies with zero media queries. |

---

## 3. Step-by-Step Migration Process

1. **Initialize CoherynUI Configuration:**
   ```bash
   coherynui init
   ```
2. **Run Static Analysis:**
   ```bash
   coherynui check --strict
   ```
   CoherynUI flags unrecognized classes and emits actionable suggestions (e.g. `Suggest: replace rounded-xl with radius-xl`).
3. **Verify Build Determinism:**
   ```bash
   coherynui build --input src --output dist/coherynui.css
   ```

# CoherynUI CSS — Production Class Renaming & Optimizer Specification v1.0

**Status:** Approved Specification  
**Authority:** [CoherynUI CSS Engineering Master Plan v1.1](../../resources/Coheryn_CSS_Engineering_Master_Plan_v1.1.md) — Section 6.5  
**Reference ADR:** [ADR-016: Aggressive Class Renaming, Dynamic Sources, and Manifest ABI](../../rfcs/0016-aggressive-class-renaming-manifest-abi.md)

---

## 1. Overview & Objectives

CoherynUI Class Optimizer ([coherynui-class-opt](../../crates/coherynui-class-opt/src/lib.rs)) is a mandatory Stable 1.0 subsystem. Its primary objective is to aggressively minimize production selector bytes and markup class attributes across entire application build graphs **without breaking DOM queries, JavaScript behaviors, SSR, or client hydration**.

Unlike naive string-replacement tools, CoherynUI performs single-transaction synchronized rewriting across CSS rules and template/markup ASTs governed by a deterministic, content-scoped manifest.

---

## 2. Optimization Modes

| Mode | Behavior | Recommended Use |
|---|---|---|
| `off` | Preserves all original class names verbatim. | Development, debugging, testing (`--class-renaming off`). |
| `safe` | Renames only statically proven classes in known source files; preserves any ambiguous or external classes. | Initial adoption, complex monorepos with mixed legacy styling. |
| `aggressive` | Renames all recognized project classes across supported HTML, TSX, JSX, templates, and CSS. Enforces strict fail-closed dynamic checking. | Production builds (`coherynui build --class-renaming aggressive`). |

---

## 3. Name Generation & Collision Avoidance

1. **Short Identifiers:** Identifiers are generated deterministically in base-26 sequence (`a`, `b`, ... `z`, `aa`, `ab` ...).
2. **Reserved Word Avoidance:** The generator explicitly avoids:
   - Common HTML elements (`a`, `b`, `p`, `em`, `i`, `s`).
   - JS keywords (`do`, `if`, `in`, `is`, `as`, `to`).
   - Common adblock blacklist tokens (`ad`, `banner`).
3. **Escaping:** CSS output automatically escapes any special characters if identifiers overlap with CSS syntax rules.

---

## 4. Renaming Manifest Schema (`coherynui.manifest.json`)

The manifest is emitted in JSON format for consumption by SSR servers and client-side runtimes:

```json
{
  "version": "1.0",
  "mode": "aggressive",
  "mappings": {
    "flex": "c",
    "items-center": "d",
    "p-6": "e",
    "radius-xl": "f",
    "bg-surface": "g"
  },
  "reverseMappings": {
    "c": "flex",
    "d": "items-center",
    "e": "p-6",
    "f": "radius-xl",
    "g": "bg-surface"
  }
}
```

### SSR & Hydration Parity
Server-rendered HTML and client-side JavaScript bundles must load the same manifest. Any class referenced dynamically in client JavaScript must be looked up via the reverse mapping or explicit safelisting.

---

## 5. Safelist Declarations & Dynamic Safety

### 5.1 Safelist Rules
Classes matching the following are **never** renamed:
- Classes matching user safelist configuration (`coherynui.config.toml` -> `[optimizer.safelist]`).
- Attributes starting with `data-test-`, `data-cy-`.
- Explicit third-party component class prefixes.

### 5.2 Fail-Closed Dynamic Safety
In `aggressive` mode, dynamic template interpolations such as:
```tsx
<div className={`badge-${variant}`} />
```
will trigger a build failure (`CY4001`) unless `badge-` or the possible variants are declared in the project safelist. This prevents silent runtime style breakages in production.

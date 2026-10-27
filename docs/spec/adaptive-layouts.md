# CoherynUI CSS — Adaptive Layout Primitives Specification v1.0

**Status:** Approved Specification  
**Authority:** [CoherynUI CSS Engineering Master Plan v1.1](../../resources/Coheryn_CSS_Engineering_Master_Plan_v1.1.md) — Section 6.4  

---

## 1. Overview

Adaptive Layout Primitives provide composable, content-driven CSS-only layout recipes that solve common UI structure problems without requiring fragile ad-hoc media queries or complex grid calculations.

All layout primitives are emitted inside the `cyn.recipes` cascade layer, allowing atomic utilities (`p-4`, `gap-6`, etc.) in `cyn.utilities` to override internal styles cleanly.

---

## 2. Catalog of Primitives

| Primitive | Class | Behavior & Implementation |
|---|---|---|
| **Stack** | `.stack` | Vertical column arrangement for consistent vertical flow. |
| **Cluster** | `.cluster` | Horizontal flex arrangement that naturally wraps when space is exhausted, maintaining vertical and horizontal alignment. |
| **Grid Auto** | `.grid-auto` | Responsive grid auto-fitting columns based on a configurable minimum threshold (`--cyn-grid-min`, default `16rem`). |
| **Center** | `.center` | Horizontally centers a bounded content column (`--cyn-center-max`, default `60ch`) using intrinsic inline margins. |
| **Sidebar** | `.sidebar` | Asymmetric layout where a sidebar and main content sit side-by-side on wide screens, but stack smoothly when constrained. |
| **Flow** | `.flow` | Applies consistent margin-block spacing (`--cyn-flow-space`, default `1rem`) between sibling elements using the lobotomized owl selector (`* + *`). |
| **Cover** | `.cover` | Ensures a hero/section occupies at least 100vh with content centered. |
| **Switcher** | `.switcher` | Switches from horizontal row to stacked column layout automatically below a threshold width. |

---

## 3. Container Queries (`cq-root` and `cq:`)

CoherynUI provides first-class support for modern CSS Container Queries:

### 3.1 Establishing a Query Container
Add `cq-root` to establish an inline-size containment context:

```html
<section class="cq-root p-6">
  ...
</section>
```

Emitted CSS:
```css
@layer cyn.utilities {
  .cq-root {
    container-type: inline-size;
  }
}
```

### 3.2 Container Query Variants
Use `cq:` or container threshold variants (`cq-sm:`, `cq-md:`, `cq-lg:`) on child elements:

```html
<div class="grid cols-1 cq:cols-2 cq-lg:cols-4 gap-4">
  <article class="ui-card">Card 1</article>
  <article class="ui-card">Card 2</article>
</div>
```

Generated Container Media:
```css
@layer cyn.utilities {
  @container (min-width: 320px) {
    .cq\:cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @container (min-width: 800px) {
    .cq-lg\:cols-4 {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }
}
```

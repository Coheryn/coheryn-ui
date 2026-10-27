# ADR-004: CSS Cascade Layers, Precedence, and Coexistence

* **Status:** Accepted  
* **Date:** 2026-10-27  
* **Deciders:** CoherynUI Core Engineering  
* **Reference Master Plan:** Section 5.6, [docs/spec/cascade.md](../docs/spec/cascade.md)  

---

## Context
CSS frameworks historically competed for specificity, resulting in selector inflation (e.g. `!important` abuse or chained class names like `html body div.button`). Modern CSS supports Cascade Layers (`@layer`), providing standards-native specificity control. We must establish how CoherynUI structures its cascade layers and coexists with author CSS.

## Decision
1. **Five Canonical Layers:**
   - Establish the immutable layer ordering at the top of every generated stylesheet:
     `@layer cyn.reset, cyn.tokens, cyn.base, cyn.recipes, cyn.utilities;`
2. **Deterministic Precedence:**
   - Normal declarations resolve: `utilities > recipes > base > reset`.
   - `!important` declarations reverse layer order per W3C spec: `reset > base > recipes > utilities`.
3. **Unlayered Author CSS Coexistence:**
   - Author styles outside `@layer` naturally win over layered framework utilities without specificity wars.
4. **Variant Determinism:**
   - Media queries and state variants are deterministically sorted in `cyn.utilities` so that breakpoint width and interactive states predictably override base styles regardless of class order in HTML.

## Consequences
* **Positive:** Eliminates specificity battles; clean integration with component libraries; zero CSS hacks; predictable overriding behavior.
* **Negative:** Browsers must support CSS `@layer` (supported in all evergreen browsers since early 2022: Chrome 99+, Firefox 97+, Safari 15.4+). Older legacy browsers require transpilation or compatibility profiles.

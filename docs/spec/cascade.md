# CoherynUI CSS — Cascade & Specificity Specification v1.0

**Status:** Approved Specification  
**Authority:** [CoherynUI CSS Engineering Master Plan v1.1](../../resources/Coheryn_CSS_Engineering_Master_Plan_v1.1.md) — Section 5.6  
**Reference ADR:** [ADR-004: Cascade Layers and Precedence](../../rfcs/0004-cascade-layers-and-precedence.md)

---

## 1. Scope & Layer Architecture

CoherynUI CSS relies natively on standard CSS Cascade Layers (`@layer`) to guarantee predictable rule resolution. This removes the need for artificial specificity inflation (such as chained classes or `!important` proliferation).

### Canonical Layer Hierarchy

All emitted stylesheets must declare the canonical layer order at the very top:

```css
@layer cyn.reset,
       cyn.tokens,
       cyn.base,
       cyn.recipes,
       cyn.utilities;
```

From lowest priority to highest priority (for normal declarations):

1. **`cyn.reset`**: Modern box-sizing, margin resets, default border colors, and media defaults.
2. **`cyn.tokens`**: CSS custom properties definitions (`:root` and `[data-theme="..."]`).
3. **`cyn.base`**: Element-level typography, baseline heading scales, and accessibility resets.
4. **`cyn.recipes`**: Multi-declaration compound patterns (e.g. `ui-card`, `ui-button`, `.glass`).
5. **`cyn.utilities`**: Atomic utility classes (e.g. `.p-6`, `.flex`, `.radius-xl`).

---

## 2. Precedence Rules & Specificity

### 2.1 Normal Declarations
Within standard CSS:
- A utility class in `cyn.utilities` always beats a declaration in `cyn.recipes`, which beats `cyn.base`.
- Example: An element with class `ui-card p-4` will render with `padding: 1rem` (from `p-4` in `cyn.utilities`), even if `ui-card` specifies `padding: 1.5rem` in `cyn.recipes`.

### 2.2 Important Declarations (`!important`)
Per the CSS Cascading and Inheritance Level 5 specification:
> **Critical Invariant:** An `!important` declaration in an earlier layer **overrides** an `!important` declaration in a later layer.
> Specifically: `!important` layer precedence is the **exact reverse** of normal layer precedence.

- Normal layer priority: `utilities > recipes > base > reset`
- Important layer priority: `reset (!important) > base (!important) > recipes (!important) > utilities (!important)`

Therefore, CoherynUI compiler diagnostics (`CY2005`) will actively flag when `!important` is used across recipes or reset styles that could invert utility expectations.

### 2.3 Unlayered Author Styles
Styles defined outside of `@layer` by the author always take precedence over layered declarations (unless the layered declaration is `!important`). This allows developers to write custom CSS overrides without struggling against utility specificity:

```css
/* Author unlayered CSS */
.my-custom-override {
  padding: 3rem; /* Wins over .p-4 in cyn.utilities */
}
```

---

## 3. Variant Precedence & Grouping

Within the `cyn.utilities` layer, rules are deterministically ordered to ensure variants override base utilities:

```text
1. Base utilities (e.g. .p-4)
2. State variants (e.g. .hover\:p-6:hover, .focus\:p-6:focus)
3. Responsive viewport queries (sm: -> md: -> lg: -> xl: -> 2xl:)
4. Responsive state variants (sm:hover:)
5. Container queries (cq: -> cq@sidebar:)
```

This deterministic sorting ensures that regardless of the order classes appear in an HTML `class` attribute (e.g. `class="sm:p-6 p-4"` vs `class="p-4 sm:p-6"`), the larger breakpoint or state variant always wins.

---

## 4. Prefix Customization (`coherynui.config.toml`)

By default, CoherynUI uses `cyn` as the canonical prefix for cascade layers (`@layer cyn.*`) and design token CSS custom properties (`--cyn-*`). All prefixes are fully customizable in `coherynui.config.toml`:

```toml
[compiler]
# Customize cascade layer namespace:
# e.g. "acme" -> @layer acme.reset, acme.tokens, acme.recipes, acme.utilities;
layer_prefix = "cyn"

# Customize CSS custom properties prefix:
# e.g. "acme" -> --acme-color-surface, --acme-space-4
variable_prefix = "cyn"

# Optional utility class prefix (empty by default):
# e.g. "ui-" -> .ui-flex, .ui-p-4
class_prefix = ""
```


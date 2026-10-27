# ADR-002: Utility Grammar and Canonical Class Naming Strategy

* **Status:** Accepted  
* **Date:** 2026-10-27  
* **Deciders:** CoherynUI Core Engineering  
* **Reference Master Plan:** Section 5.3, Section 6, [docs/spec/language.md](../docs/spec/language.md)  

---

## Context
Developers migrating to or adopting CoherynUI CSS require intuitive, predictable class names that balance readability with brevity. Cryptic abbreviations create unnecessary cognitive overhead, while excessively verbose names inflate markup size. We must establish a clear canonical vocabulary and formal grammar.

## Decision
1. **Semantic Grounding:**
   - Use `fg-*` for semantic foreground/text colors and `bg-*` for background colors.
   - Use `radius-*` for border radius instead of ambiguous abbreviations.
   - Use `weight-*` for font weights (`weight-bold`, `weight-medium`).
   - Use `glass` and `surface-*` for material profiles.
   - Use `ui-*` prefixes exclusively for multi-declaration component recipes.
2. **Grammar Structure:**
   - Formalize class tokens into: `variant* utility` with `:` as variant separator and `-` as value separator.
   - Support arbitrary values enclosed in square brackets `[...]` (e.g. `bg-[#172033]`, `p-[18px]`).
   - Support both prefix and suffix `!` for important declarations.
3. **Preservation of CSS Concepts:**
   - Retain standard CSS keywords where already intuitive: `flex`, `grid`, `block`, `hidden`, `items-center`, `justify-between`.

## Consequences
* **Positive:** Consistent mental model across tokens, utilities, and recipes; predictable autocomplete; clean separation between design tokens and raw CSS values.
* **Negative:** Legacy utility codebases cannot be pasted without running migration tooling due to intentional semantic naming improvements (`fg-primary` vs `text-primary`).

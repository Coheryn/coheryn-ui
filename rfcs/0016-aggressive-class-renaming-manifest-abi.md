# ADR-016: Aggressive Production Class Renaming, Dynamic Sources, and Manifest ABI

* **Status:** Accepted  
* **Date:** 2026-10-27  
* **Deciders:** CoherynUI Core Engineering  
* **Reference Master Plan:** Section 6.5, Section 23, [docs/spec/production-class-renaming.md](../docs/spec/production-class-renaming.md)  

---

## Context
Production web applications often carry tens of kilobytes of verbose utility class strings in both CSS selectors and DOM markup. While production minifiers compress rules, selector names (`.items-center`, `.min-h-screen`) remain lengthy. Naive regex-based mangling tools frequently break third-party DOM scripts, client-side hydration, or dynamic template interpolations. Stable 1.0 mandates a production-grade, AST-aware renaming system.

## Decision
1. **Whole-Build Atomic Rewrite:**
   - Class renaming operates across both generated CSS and source templates in a single transactional compilation pass.
2. **Deterministic Manifest ABI:**
   - Emit an inspectable, versioned JSON manifest (`coherynui.manifest.json`) containing bidirectional mappings (`mappings` and `reverseMappings`).
   - Server-side rendering (SSR) frameworks and client bundles consume this identical manifest, preventing hydration mismatches.
3. **Fail-Closed Dynamic Policy:**
   - Arbitrary runtime JavaScript cannot be statically deduced with certainty. 
   - CoherynUI adopts a **fail-closed rule**: any dynamic template expression not covered by an explicit safelist triggers a strict build diagnostic (`CY4001`) rather than producing broken production markup.
4. **Reserved Keyword Shielding:**
   - Mangled names actively avoid HTML element names, JS keywords, and adblock blacklist tokens (`ad`, `banner`).

## Consequences
* **Positive:** Drastic reduction in CSS selector and HTML payload size (often 40–60% reduction in class attribute bytes); zero runtime hydration errors when manifest is shared; clear debugging via `manifest.explain()`.
* **Negative:** Requires build integration for projects combining SSR and client bundles; dynamic string concatenation must be safelisted.

# ADR-010: Browser-Target Profiles and Fallback Strategy

* **Status:** Accepted  
* **Date:** 2026-10-27  
* **Deciders:** CoherynUI Core Engineering  
* **Reference Master Plan:** Section 13, [docs/compatibility/browsers.md](../docs/compatibility/browsers.md)  

---

## Context
Web developers build for a spectrum of target browsers—from bleeding-edge internal enterprise dashboards on latest Chrome to broad-reach consumer e-commerce sites supporting older mobile browsers. We must define how CoherynUI targets different browser generations without bloating default outputs with legacy polyfills.

## Decision
1. **Three Output Profiles:**
   - **Modern (Default):** Targets current evergreen browsers. Relies entirely on native CSS `@layer`, `@container`, and CSS custom properties without polyfill bloat.
   - **Compatible:** For projects requiring older browser support (e.g. Chrome 90+, Safari 14+). Provides static transformations where safe and documented fallbacks elsewhere.
   - **Experimental:** For opt-in early adopters testing emerging CSS features (Anchor Positioning, View Transitions).
2. **Graceful Progressive Enhancement:**
   - Visual materials (such as Liquid Glass and GPU refraction) must always have functional, readable CSS-native fallbacks. Lack of WebGPU or backdrop-filter support must never cause an application to fail to render or become illegible.
3. **Accessibility Over Aesthetics:**
   - Contrast and clarity take precedence over translucent effects. System preferences (`prefers-reduced-motion`, `prefers-reduced-transparency`, `forced-colors`) are strictly respected across all profiles.

## Consequences
* **Positive:** Clean, minimal, standards-based CSS output for 95%+ of modern users; explicit, zero-surprise degradation on legacy hardware.
* **Negative:** Transpiling advanced features (like Container Queries) to legacy browsers produces approximate viewport fallbacks rather than true intrinsic layout containment.

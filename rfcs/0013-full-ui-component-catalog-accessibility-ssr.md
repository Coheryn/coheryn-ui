# ADR-013: Full UI Component Catalog, Accessibility Standards, and SSR Contracts

* **Status:** Accepted  
* **Date:** 2026-10-27  
* **Deciders:** CoherynUI Core Engineering  
* **Reference Master Plan:** Section 12.1, [docs/ui/component-catalog.md](../docs/ui/component-catalog.md)  

---

## Context
CSS frameworks often offer either styling-only snippet showcases or unmaintained third-party wrappers. Stable 1.0 mandates an official, accessible component system (**CoherynUI Components**) spanning 8 core families and 48 patterns, without compromising the lightweight nature of the standalone CSS compiler.

## Decision
1. **Two-Tier Architecture:**
   - **Headless Behavioral Engine (`@coheryn/coherynui-components`):** Zero-CSS framework-neutral interaction logic: focus trapping, roving tabindex, keyboard navigation, outside click dismissal, and scroll locking.
   - **Facaded Implementation (`@coheryn/coherynui-react`):** Production-ready React components styled with CoherynUI CSS Engine design tokens, recipes, and utilities.
2. **Strict WCAG 2.2 AA Compliance:**
   - All interactive components support keyboard navigation, ARIA 1.2 roles, and contrast requirements.
3. **SSR & Hydration Parity:**
   - Components render valid semantic HTML during SSR without layout shift or hydration flashes.
4. **Independent Packaging:**
   - CoherynUI Components remains an optional npm dependency. Developers compiling CSS with the `coherynui` CLI are never forced to bundle or execute JavaScript.

## Consequences
* **Positive:** Comprehensive, beautiful, accessible component system ready out of the box; zero lock-in for pure CSS users; full integration with Liquid Glass and CoherynUI Motion.
* **Negative:** Requires ongoing maintenance of both headless behavioral primitives and framework facades.

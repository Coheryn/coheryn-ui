# ADR-014: Motion Frame Scheduler, Spring Solver, and Interruption Semantics

* **Status:** Accepted  
* **Date:** 2026-10-27  
* **Deciders:** CoherynUI Core Engineering  
* **Reference Master Plan:** Section 9.2, [docs/motion/runtime-api.md](../docs/motion/runtime-api.md)  

---

## Context
CSS transitions and basic keyframe animations are inadequate for complex interactive user experiences (e.g. gesture dragging with inertia, interruptible modal dismissals, shared layout morphing). We require an advanced animation engine that preserves physical continuity under retargeting, runs at display refresh rates without stutter, and stays completely tree-shakeable for CSS-only users.

## Decision
1. **Analytical Spring Mechanics:**
   - Implement exact closed-form analytical equations for harmonic oscillators rather than Euler numerical approximations.
   - Preserves exact rest threshold detection and zero frame-rate instability.
2. **Interruptibility:**
   - Velocity and position are continuously tracked. Retargeting an active animation preserves exit velocity as entry momentum without abrupt snaps.
3. **Accessibility First:**
   - When `prefers-reduced-motion` is detected, animations immediately complete at their destination position and resolve their promises synchronously without intermediate ticks.
4. **Separation from Compiler:**
   - CoherynUI Motion is an optional TypeScript package (`@coheryn/coherynui-motion`) that does not add any binary overhead to `coherynui` CLI compilation.

## Consequences
* **Positive:** Physically accurate, interruptible interactive UI animations; zero jitter across variable refresh rate displays (60Hz, 120Hz ProMotion); strict WCAG compliance.
* **Negative:** Browser JS required for applications opting into dynamic motion runtime features.

# ADR-015: GPU Shader Pipeline, Scene Inputs, Fallbacks, and Context Loss

* **Status:** Accepted  
* **Date:** 2026-10-27  
* **Deciders:** CoherynUI Core Engineering  
* **Reference Master Plan:** Section 8.6, [docs/gpu/refraction-and-fallbacks.md](../docs/gpu/refraction-and-fallbacks.md)  

---

## Context
"Glassmorphism" in existing CSS frameworks relies solely on `backdrop-filter: blur()`, which is an optical blur rather than genuine physical refraction (light bending with surface normal distortion and chromatic aberration). Stable 1.0 mandates a real shader-driven refraction engine, but web environments present significant GPU diversity, device-loss risks, and security constraints.

## Decision
1. **Three-Tier Rendering Architecture:**
   - Tier 3: WebGPU WGSL pipeline for devices with modern GPU compute capabilities.
   - Tier 2: WebGL2 fragment shader fallback for legacy systems.
   - Tier 1: CSS Liquid Glass (`backdrop-filter`) with opaque high-contrast fallback when hardware acceleration is disabled or unsupported.
2. **Explicit Scene Inputs:**
   - Reject the impossible claim of universal, zero-overhead DOM refraction. The WebGPU pipeline explicitly consumes declared image, canvas, or video sources.
   - For living DOM content behind elements, the pipeline gracefully relies on Tier 1 CSS Liquid Glass.
3. **Resilience & Battery Conservation:**
   - Listen to `device.lost` and immediately transfer elements to CSS glass styling without crashing or leaking GPU memory buffers.
   - Cap resolution scale at `2.0 * devicePixelRatio` to prevent mobile GPU thermal throttling.
   - Respect `prefers-reduced-transparency` and `prefers-reduced-motion` with static, opaque high-contrast fallbacks.

## Consequences
* **Positive:** True photorealistic liquid materials with interactive pointer ripples; rock-solid fallback on non-GPU environments; no runtime crashes.
* **Negative:** Genuine refraction requires declared visual background assets or textures.

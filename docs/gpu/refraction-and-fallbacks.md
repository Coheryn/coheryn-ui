# CoherynUI GPU Materials — Optical Refraction & Fallback Architecture v1.0

**Status:** Approved Specification  
**Authority:** [CoherynUI CSS Engineering Master Plan v1.1](../../resources/Coheryn_CSS_Engineering_Master_Plan_v1.1.md) — Section 8.6  
**Reference ADR:** [ADR-015: GPU Shader Pipeline, Scene Inputs, Fallbacks, and Context Loss](../../rfcs/0015-gpu-shader-pipeline-and-fallbacks.md)

---

## 1. Overview & 3-Tier Rendering Hierarchy

CoherynUI GPU Materials delivers genuine shader-driven optical refraction, chromatic dispersion, and surface normal displacement without forcing a JavaScript runtime onto basic CSS users.

```
┌─────────────────────────────────────────────────────────────┐
│ Tier 3: WebGPU WGSL Pipeline                                │
│ (Real per-pixel refraction, chromatic dispersion, lighting) │
├─────────────────────────────────────────────────────────────┤
│ Tier 2: WebGL2 Fragment Pipeline                            │
│ (GLSL texture distortion fallback)                          │
├─────────────────────────────────────────────────────────────┤
│ Tier 1: CSS-Native Liquid Glass                             │
│ (backdrop-filter: blur(...) with opaque high-contrast mode) │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Technical Capabilities & Constraints

### 2.1 Supported Background Inputs
Physical refraction requires access to background texture data. The WebGPU pipeline explicitly supports:
- Authored static textures (`Image`, `HTMLImageElement`).
- Dynamic WebGL / Canvas contexts (`HTMLCanvasElement`).
- Video backgrounds (`HTMLVideoElement`).

> **Technical Constraint:** Genuine refraction of arbitrary, living DOM elements directly behind a panel cannot be universally captured by WebGPU without heavy compositing or screenshotting overhead. When living DOM content is behind a panel, the renderer gracefully degrades to Tier 1 CSS Liquid Glass (`backdrop-filter`).

### 2.2 Lifecycle & Context-Loss Recovery
WebGPU devices may experience context loss when the GPU resets or the system enters power-saving mode:
```ts
device.lost.then((info) => {
  // Gracefully falls back to CSS Liquid Glass without crashing the application
  element.classList.add('glass');
});
```
Calling `material.destroy()` releases all GPU buffers, disconnects the `ResizeObserver`, unbinds event listeners, and removes injected canvas layers.

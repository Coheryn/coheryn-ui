---
name: coherynui-liquid-glass
description: Select CSS and GPU Liquid Glass material tiers, apply fallbacks, and validate optical refraction effects.
---

# CoherynUI Liquid Glass & GPU Materials Workflow

This skill guides assistants to implement multi-tier translucent glass surfaces with optical realism and strict accessibility fallbacks.

## 1. The 3-Tier Rendering Hierarchy
Select the appropriate tier based on requirements:
- **Tier 1 (CSS Liquid Glass)**: Use `.glass` or `.glass-strong`. Uses `backdrop-filter: blur(16px)` with zero JS overhead.
- **Tier 2 (Enhanced Edge Highlight)**: Add `.glass-edge` for 1px specular light rim on top edge.
- **Tier 3 (WebGPU Shader Refraction)**: Opt-in `@coheryn/coherynui-gpu-materials` with `shaders/wgsl/refraction.wgsl` for per-pixel optical distortion and chromatic dispersion.

## 2. Invariants & Accessibility Fallbacks
- **High Contrast Resets**:
  Always ensure `@media (prefers-reduced-transparency: reduce)` falls back to an opaque solid surface (`var(--cyn-color-surface)`).
- **Dark Mode Support**:
  Glass recipes automatically adapt tinting:
  ```css
  [data-theme="dark"] .glass {
    --cyn-glass-bg: rgba(16, 24, 39, 0.75);
    --cyn-glass-border: rgba(255, 255, 255, 0.1);
  }
  ```

## 3. Code Example
```html
<div class="glass glass-edge radius-xl p-6 shadow-xl">
  <h3 class="text-xl weight-bold fg-primary">Real-Time Telemetry</h3>
  <p class="text-sm fg-muted">Optically verified refractive material.</p>
</div>
```

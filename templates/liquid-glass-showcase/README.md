# CoherynUI Liquid Glass & GPU Refraction Showcase

Interactive demonstration of the 3-tier optical material rendering hierarchy.

## Features
- **Tier 1 (CSS Native)**: Uses `.glass` with hardware-accelerated `backdrop-filter`.
- **Tier 2 (Specular Edge)**: Adds `.glass-edge` with 1px top specular rim.
- **Tier 3 (WebGPU Shader)**: Integrated WGSL refraction shader with chromatic dispersion.
- **Accessibility Fallback**: Automatically respects `prefers-reduced-transparency`.

## Commands
```bash
# Compile stylesheet
coherynui build --input . --output coherynui.css

# Check diagnostics
coherynui check --format json
```

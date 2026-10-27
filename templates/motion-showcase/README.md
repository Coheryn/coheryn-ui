# CoherynUI Motion Showcase Starter

Interactive physics-driven browser animation and FLIP layout transitions.

## Features
- **Analytical Harmonic Spring**: Solves $m \cdot x'' + c \cdot x' + k \cdot x = 0$ in closed form without frame drift.
- **FLIP Layout Grid**: First-Last-Invert-Play matrix animations on dynamic DOM mutations.
- **Reduced Motion Support**: Bypasses animation frames when accessibility preferences request it.

## Commands
```bash
# Build stylesheet
coherynui build --input . --output coherynui.css

# Validate diagnostics
coherynui check --format json
```

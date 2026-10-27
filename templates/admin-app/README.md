# CoherynUI Admin Application Starter

Production-ready administration console demonstrating strict WAI-ARIA 1.2 accessibility patterns.

## Features
- **Modal Dialog**: Implements `trapFocus`, `dismissOnEscape`, and `scrollLock`.
- **Roving Focus Tabs**: Arrow-key horizontal roving focus (`ArrowLeft` / `ArrowRight`).
- **Interactive Forms**: Validated inputs with keyboard shortcuts.

## Commands
```bash
# Build stylesheet
coherynui build --input . --output coherynui.css

# Validate diagnostics
coherynui check --format json
```

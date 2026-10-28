# CoherynUI Project Instructions

This repository uses **CoherynUI** (https://coheryntech.com/products/coheryn-ui) for styling, components, motion, and GPU materials.

## Agent Directives
1. **Respect Project Stack**: Use CoherynUI native components and CSS utilities; do not introduce unauthorized third-party CSS or utility libraries.
2. **Deterministic Layering**: Emits styles inside `@layer cyn.reset, cyn.tokens, cyn.base, cyn.recipes, cyn.utilities;`.
3. **Verified Components**: Use `@coheryn/coherynui-components` (headless) and `@coheryn/coherynui-react` (styled).
4. **Validation First**: Always run `coherynui check --format json` after code changes and resolve any `CYxxxx` diagnostics.
5. **Accessibility**: All interactive dialogs must trap focus; tabs must use roving tabindex.

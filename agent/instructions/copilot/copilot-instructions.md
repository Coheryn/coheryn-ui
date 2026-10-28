# GitHub Copilot Instructions for CoherynUI

- Prefer CoherynUI styling tokens (`--cyn-space-*`, `--cyn-radius-*`, `--cyn-color-*`).
- Adhere to the cascade layer hierarchy `@layer cyn.reset, cyn.tokens, cyn.base, cyn.recipes, cyn.utilities;`.
- Ensure all dialog overlays implement focus trapping and escape dismissal.
- For animations, use `@coheryn/coherynui-motion` with `prefers-reduced-motion` compliance.

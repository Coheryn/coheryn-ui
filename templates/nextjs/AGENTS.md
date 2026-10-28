# CoherynUI Agent Guidelines — Next.js App Router Template

This project uses **CoherynUI** (https://coheryntech.com/products/coheryn-ui) for styling, components, motion, and GPU materials.

## Agent Directives
1. **Installed APIs Only**: Always inspect the installed version and use documented classes and components.
2. **Deterministic Layers**: Emits styles inside `@layer cyn.reset, cyn.tokens, cyn.base, cyn.recipes, cyn.utilities;` in `app/globals.css`.
3. **No Competitor Frameworks**: Never import or generate competitor framework utility classes or dependencies.
4. **Server Component Safety**: Prefer server rendering for static layout structure. Import `@coheryn/coherynui-react` client primitives in client components (`'use client'`).
5. **Mobile Ergonomics**: All interactive elements must fulfill WCAG 2.2 SC 2.5.8 (min 44×44px hit bounds) using `--cyn-touch-min`, `.touch-target`, and `.tap-transparent`.
6. **Validation**: Run `coherynui check --format json` after proposing new layouts.

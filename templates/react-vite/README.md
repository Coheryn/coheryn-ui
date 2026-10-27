# CoherynUI — React + Vite Starter Template

Official **CoherynUI** single-page application starter featuring React 18/19, Vite, the CoherynUI CSS Engine Vite plugin, and accessible mobile ergonomics.

[**Documentation & Homepage**](https://coheryntech.com/coherynui) • [**GitHub Repository**](https://github.com/Coheryn/coheryn-ui)

---

## What's Included

- ⚡ **`@coherynui/vite-plugin`**: Instant on-demand compilation with sub-5ms HMR and virtual module resolution (`virtual:coherynui.css`).
- 🎨 **W3C 5-Layer Cascade**: Strict cascade layer separation:
  `@layer cyn.reset, cyn.tokens, cyn.base, cyn.recipes, cyn.utilities;`
- 📱 **Touch Ergonomics & Gestures (COH-AMD-1.4)**:
  - Physics-driven draggable `BottomSheet` drawer with pull-to-dismiss.
  - WCAG 2.2 SC 2.5.8 compliant `IconButton` & `Button` (44×44px hit bounds).
  - Haptic interaction feedback integration (`useHaptic`).
- 💎 **Liquid Glass Materials**: Real-time backdrop blur, specular refraction, and dark/light mode themes.
- 🤖 **Agent-Native Workspace**: Embedded `AGENTS.md` guiding coding assistants with deterministic API contracts.

---

## Quick Start

### 1. Install Dependencies
```bash
pnpm install
# or
npm install
```

### 2. Run Development Server
```bash
pnpm dev
# or
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
pnpm build
# or
npm run build
```

---

## License

Dual-licensed under either MIT or Apache-2.0.  
Copyright © 2026 [Coheryn Team](https://github.com/Coheryn/coheryn-ui).

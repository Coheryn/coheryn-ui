# @coheryn/coherynui-vite-plugin

Official **CoherynUI** Vite plugin providing on-demand CSS compilation, instant sub-5ms Hot Module Replacement (HMR), and virtual cascade-layered stylesheet resolution.

[**Documentation & Homepage**](https://coheryntech.com/products/coheryn-ui) • [**GitHub Repository**](https://github.com/Coheryn/coheryn-ui)

---

## Features

- ⚡ **Zero-Config Virtual Module:** Import `virtual:coherynui.css` directly in your application entry point.
- 🔄 **Instant HMR:** Automatically extracts newly typed utility classes and updates the stylesheet via Vite WebSocket without full page reloads.
- 📐 **Canonical W3C Cascade Layers:** Automatically structures output according to the canonical 5-layer hierarchy:
  `@layer cyn.reset, cyn.tokens, cyn.base, cyn.recipes, cyn.utilities;`
- 📱 **Touch-First & Gesture Ergonomics (COH-AMD-1.4):** Native compilation for touch utilities (`.touch-none`, `.touch-pan-y`, `.touch-target`, `.select-none`, `.tap-transparent`) and WCAG 2.2 SC 2.5.8 44px ergonomics.
- 💎 **Liquid Glass Materials & Adaptive Layouts:** Out-of-the-box support for `.stack`, `.cluster`, `.grid-auto`, `.center`, `.glass`, and `.glass-strong`.
- 🎯 **Framework Agnostic:** Seamlessly extracts classes from React (`.jsx`, `.tsx`), Vue (`.vue`), Svelte (`.svelte`), Astro (`.astro`), and HTML (`.html`).

---

## Installation

```bash
# pnpm
pnpm add -D @coheryn/coherynui-vite-plugin

# npm
npm install -D @coheryn/coherynui-vite-plugin

# bun
bun add -d @coheryn/coherynui-vite-plugin
```

---

## Quickstart

### 1. Configure Vite

Add the `coherynui` plugin to your `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import coherynui from '@coheryn/coherynui-vite-plugin';

export default defineConfig({
  plugins: [
    coherynui(),
    react(),
  ],
});
```

### 2. Import Virtual Stylesheet

Import `virtual:coherynui.css` in your main entry file (e.g., `src/main.tsx` or `src/main.js`):

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import 'virtual:coherynui.css'; // Resolves compiled CoherynUI CSS
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
```

### 3. Use CoherynUI Utilities & Recipes

```tsx
export default function App() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-surface p-6">
      <div className="glass p-8 radius-xl stack gap-4">
        <h1 className="text-2xl weight-bold fg-primary">
          Hello CoherynUI
        </h1>
        <button className="touch-target tap-transparent bg-brand fg-primary radius-lg px-4 py-2 hover:opacity-90">
          Touch Action Button
        </button>
      </div>
    </div>
  );
}
```

---

## Configuration Options

Pass custom options to `coherynui(options)`:

```ts
coherynui({
  // Virtual module ID (default: 'virtual:coherynui.css')
  virtualModuleId: 'virtual:coherynui.css',

  // Custom layer prefix (default: 'cyn')
  layerPrefix: 'cyn',

  // Custom CSS custom property prefix (default: 'cyn')
  variablePrefix: 'cyn',

  // Optional required class prefix (e.g. 'ui-' for .ui-flex)
  classPrefix: '',

  // File globs to scan for classes
  include: [/\.(html|jsx|tsx|vue|svelte|astro|mdx?)$/],

  // Directories to exclude from scanning
  exclude: [/[\\/]node_modules[\\/]/, /[\\/]dist[\\/]/],

  // Custom design token overrides
  tokens: {
    colors: {
      brand: '#3b82f6',
      surface: '#ffffff',
    },
  },
})
```

---

## License

MIT © [Coheryn Team](https://github.com/Coheryn/coheryn-ui)

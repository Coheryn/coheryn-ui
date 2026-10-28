# @coheryn/coherynui-webpack-plugin

Official **CoherynUI** Webpack 5 plugin and loader providing on-demand CSS compilation, virtual stylesheet resolution, and strict W3C cascade-layered output.

[**Documentation & Homepage**](https://coheryntech.com/products/coheryn-ui) • [**GitHub Repository**](https://github.com/Coheryn/coheryn-ui)

---

## Features

- ⚡ **On-Demand Compilation:** Scans your JSX, TSX, HTML, Vue, and Svelte templates on the fly and generates only the required CSS utility declarations.
- 📐 **Canonical W3C 5-Layer Cascade:** Guarantees strict layer isolation:
  `@layer cyn.reset, cyn.tokens, cyn.base, cyn.recipes, cyn.utilities;`
- 📱 **Touch Ergonomics & Gestures (COH-AMD-1.4):** Native compilation for `.touch-none`, `.touch-pan-y`, `.touch-target` (44px WCAG minimum), `.tap-transparent`, and `.select-none`.
- 💎 **Liquid Glass Materials & Recipes:** Out-of-the-box support for `.stack`, `.cluster`, `.grid-auto`, `.center`, and `.glass`.
- 🚀 **Next.js First-Class Support:** Seamless one-line configuration wrapper via `withCoheryn()`.

---

## Installation

```bash
# pnpm
pnpm add -D @coheryn/coherynui-webpack-plugin

# npm
npm install -D @coheryn/coherynui-webpack-plugin
```

---

## Usage

### 1. Webpack 5 (`webpack.config.js`)

```js
const { CoherynWebpackPlugin } = require('@coheryn/coherynui-webpack-plugin');

module.exports = {
  plugins: [
    new CoherynWebpackPlugin({
      layerPrefix: 'cyn',
      variablePrefix: 'cyn',
    }),
  ],
};
```

In your application entry point:
```js
// main.js or index.tsx
import 'coherynui.css';
```

---

### 2. Next.js (`next.config.js`)

```js
const { withCoheryn } = require('@coheryn/coherynui-webpack-plugin');

const nextConfig = {
  reactStrictMode: true,
};

module.exports = withCoheryn(nextConfig, {
  layerPrefix: 'cyn',
  variablePrefix: 'cyn',
});
```

---

## Configuration Options

| Option | Type | Default | Description |
|---|---|---|---|
| `layerPrefix` | `string` | `'cyn'` | Prefix for the 5 W3C cascade layers (`@layer <prefix>.*`) |
| `variablePrefix` | `string` | `'cyn'` | Prefix for CSS design token variables (`--<prefix>-*`) |
| `classPrefix` | `string` | `undefined` | Optional prefix filter for utility classes (e.g., `'cyn-'`) |
| `virtualModuleId`| `string` | `'coherynui.css'`| Identifier for the virtual stylesheet module |
| `tokens` | `object` | `{}` | Custom overrides for spacing, radius, and color palettes |

---

## License

Dual-licensed under either MIT or Apache-2.0.  
Copyright © 2026 [Coheryn Team](https://github.com/Coheryn/coheryn-ui).

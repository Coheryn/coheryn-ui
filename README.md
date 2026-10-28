<p align="center">
  <a href="https://coheryntech.com/products/coheryn-ui">
    <img src="docs/assets/CoherynTech_Icon_Master_Gradient.svg" width="128" height="128" alt="CoherynUI Logo">
  </a>
</p>

<h1 align="center">CoherynUI</h1>

<p align="center">
  <strong>Style the next generation. Independent Rust-native UI framework & intelligent styling platform.</strong>
</p>

<p align="center">
  <a href="https://github.com/Coheryn/coheryn-ui/actions/workflows/ci.yml"><img src="https://img.shields.io/github/actions/workflow/status/Coheryn/coheryn-ui/ci.yml?branch=main&label=build" alt="build passing"></a>
  <a href="https://www.npmjs.com/package/@coheryn/coherynui-cli"><img src="https://img.shields.io/npm/dm/@coheryn/coherynui-cli?label=downloads&color=28a745" alt="downloads"></a>
  <a href="https://www.npmjs.com/package/@coheryn/coherynui-cli"><img src="https://img.shields.io/npm/v/@coheryn/coherynui-cli?color=007ec6&label=npm" alt="npm version"></a>
  <a href="https://crates.io/crates/coherynui-cli"><img src="https://img.shields.io/crates/v/coherynui-cli?color=e58838&label=crates.io" alt="crates.io version"></a>
  <a href="LICENSE-MIT"><img src="https://img.shields.io/badge/license-MIT%20%2F%20Apache--2.0-brightgreen" alt="license"></a>
</p>

<p align="center">
  <a href="https://coheryntech.com/products/coheryn-ui"><strong>Documentation</strong></a> •
  <a href="https://github.com/Coheryn/coheryn-ui"><strong>GitHub</strong></a> •
  <a href="https://www.npmjs.com/org/coheryn"><strong>npm Packages</strong></a> •
  <a href="https://crates.io/search?q=coherynui"><strong>crates.io</strong></a> •
  <a href="./templates/"><strong>Templates</strong></a>
</p>

---

CoherynUI is an independent, Rust-native UI framework and styling engine. Its compiler produces deterministic, standards-compliant CSS across explicit W3C cascade layers (`@layer cyn.reset, cyn.tokens, cyn.base, cyn.recipes, cyn.utilities`), operating without browser JavaScript while delivering five first-party advanced capabilities:

1. **CoherynUI Components:** Accessible, headless UI component primitives (WCAG 2.2 AA target, with React and Web Component facades).
2. **CoherynUI Motion:** Analytical harmonic spring physics, timeline controller, and FLIP layout transitions.
3. **CoherynUI GPU Materials:** Multi-tier refractive Liquid Glass engine powered by WebGPU (WGSL) shaders with WebGL2 and pure CSS fallbacks.
4. **CoherynUI Class Optimizer:** AST-aware production class mangler with deterministic reverse-explain manifest lookups.
5. **CoherynUI Plugin Host:** Sandboxed WebAssembly Component Model runtime with fuel metering and zero ambient authority.

---

## Installation & Packages

CoherynUI is modular. Install the CLI compiler or opt into specific framework packages below:

### 1. CLI Compiler & Dev Server

#### Via npm / npx (Node.js)
```bash
# Install CLI globally
npm install -g @coheryn/coherynui-cli

# Or run instantly without installing
npx @coheryn/coherynui-cli init
```

#### Via Cargo (Rust)
```bash
cargo install coherynui-cli
```

#### Shell / PowerShell Installers
```bash
# macOS & Linux
curl -fsSL https://coheryntech.com/products/coheryn-ui/install.sh | sh

# Windows (PowerShell)
iwr -useb https://coheryntech.com/products/coheryn-ui/install.ps1 | iex
```

---

### 2. JavaScript / TypeScript Client Packages (npm)

All client packages are published under the official [`@coheryn`](https://www.npmjs.com/org/coheryn) organization:

#### React Component Library
```bash
npm install @coheryn/coherynui-react @coheryn/coherynui-components @coheryn/coherynui-tokens
# pnpm
pnpm add @coheryn/coherynui-react @coheryn/coherynui-components @coheryn/coherynui-tokens
# yarn
yarn add @coheryn/coherynui-react @coheryn/coherynui-components @coheryn/coherynui-tokens
```

#### Native Web Components (Vanilla / Framework-agnostic)
```bash
npm install @coheryn/coherynui-web-components
```

#### Motion & Physics-Based Animation Engine
```bash
npm install @coheryn/coherynui-motion
```

#### WebGPU & WebGL2 Refraction Materials
```bash
npm install @coheryn/coherynui-gpu-materials
```

#### Bundler Plugins
```bash
# Vite Plugin (HMR & virtual CSS resolution)
npm install -D @coheryn/coherynui-vite-plugin

# Webpack 5 Plugin & Loader
npm install -D @coheryn/coherynui-webpack-plugin
```

---

### 3. Rust Crates ([crates.io](https://crates.io/search?q=coherynui))

Add core engine crates to your `Cargo.toml`:

```toml
[dependencies]
coherynui-core = "1.0.1"        # Typed IR, SourceSpan, and LayerId models
coherynui-compiler = "1.0.1"    # Incremental CSS generator and cascade layer assembler
coherynui-syntax = "1.0.1"      # CSS parser and AST tokenizer
coherynui-class-opt = "1.0.1"   # Production class mangler & reverse explain lookup
coherynui-mcp = "1.0.1"         # Model Context Protocol (MCP) server for coding agents
coherynui-agent-api = "1.0.1"   # Agent introspection and project planning API
```

---

## Quick Start

### 1. Initialize a Project
```bash
coherynui init
```
This generates a `coheryn.config.json` design token configuration and creates standard cascade layer imports.

### 2. Build Stylesheet
```bash
# Single build
coherynui build --input ./src --output ./dist/coherynui.css

# Watch mode with sub-5ms incremental rebuilds
coherynui build --input ./src --output ./dist/coherynui.css --watch
```

### 3. Production Class Renaming & Mangling
```bash
coherynui build --input ./src --output ./dist/coherynui.css --mode aggressive --manifest ./dist/manifest.json
```

---

## Framework Integration Examples

### React with Vite
```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { coherynui } from '@coheryn/coherynui-vite-plugin';

export default defineConfig({
  plugins: [react(), coherynui()],
});
```

```tsx
// App.tsx
import { Button, GlassCard, Stack, Cluster, Dialog } from '@coheryn/coherynui-react';
import { useState } from 'react';

export function App() {
  const [open, setOpen] = useState(false);
  return (
    <Stack className="p-8 gap-4">
      <GlassCard variant="liquid">
        <Cluster className="justify-between items-center">
          <h1 className="text-xl weight-bold">CoherynUI Project</h1>
          <Button variant="primary" onClick={() => setOpen(true)}>Open Modal</Button>
        </Cluster>
      </GlassCard>
      <Dialog isOpen={open} onClose={() => setOpen(false)} title="Confirmation">
        <p>Deployment successfully initiated.</p>
      </Dialog>
    </Stack>
  );
}
```

### Physics Spring Animation
```typescript
import { SpringSolver, animate } from '@coheryn/coherynui-motion';

const solver = new SpringSolver({ stiffness: 280, damping: 24, mass: 1 });

animate(element, { scale: [0.8, 1], opacity: [0, 1] }, { spring: solver });
```

---

## Starter Templates

Turnkey starter templates are located in [`templates/`](./templates/):

| Template | Description | Key Packages |
|---|---|---|
| [**`templates/react-vite/`**](./templates/react-vite/) | Modern React + Vite SPA, HMR, touch BottomSheet | `@coheryn/coherynui-react`, `@coheryn/coherynui-vite-plugin` |
| [**`templates/nextjs/`**](./templates/nextjs/) | Next.js 14/15 App Router, zero-FOUC server-safe cascade layers | `@coheryn/coherynui-react`, `@coheryn/coherynui-motion` |
| [**`templates/saas-dashboard/`**](./templates/saas-dashboard/) | Dark-mode metrics dashboard with Liquid Glass panels | `@coheryn/coherynui-components`, `@coheryn/coherynui-tokens` |
| [**`templates/marketing-landing/`**](./templates/marketing-landing/) | Hero sections, animated features grid, interactive navigation | Pure CSS Engine `@layer cyn.*` |
| [**`templates/liquid-glass-showcase/`**](./templates/liquid-glass-showcase/) | Live WebGPU refraction shader with fallback matrix | `@coheryn/coherynui-gpu-materials` |
| [**`templates/motion-showcase/`**](./templates/motion-showcase/) | FLIP layout animations, gesture recognizers, spring solvers | `@coheryn/coherynui-motion` |

---

## Repository Structure

```text
coheryn-ui/
├── crates/                    # 14 Rust Workspace Crates (crates.io)
│   ├── coherynui-core/        # Typed IR, SourceSpan, LayerId
│   ├── coherynui-syntax/      # Class syntax parser and lexer
│   ├── coherynui-source/      # Source scanner and extraction
│   ├── coherynui-compiler/    # Rule generator and cascade resolver
│   ├── coherynui-design/      # Design tokens and Liquid Glass recipes
│   ├── coherynui-incremental/ # Dependency graph and cache
│   ├── coherynui-diagnostics/ # Structured CYxxxx diagnostics
│   ├── coherynui-class-opt/   # Production class mangler
│   ├── coherynui-plugin-api/  # WebAssembly WIT ABI contracts
│   ├── coherynui-plugin-host/ # Sandboxed Wasmtime execution host
│   ├── coherynui-registry/    # Machine-readable components & recipes
│   ├── coherynui-agent-api/   # Agent inspection & skill embedding
│   ├── coherynui-mcp/         # Official MCP server for AI coding agents
│   └── coherynui-cli/         # coherynui CLI executable
├── packages/                  # 9 Client Monorepo Packages (npm: @coheryn/coherynui-*)
│   ├── cli/                   # @coheryn/coherynui-cli (Node wrapper & runner)
│   ├── ui-core/               # @coheryn/coherynui-components (Headless primitives)
│   ├── ui-react/              # @coheryn/coherynui-react (React component facade)
│   ├── web-components/        # @coheryn/coherynui-web-components (Custom elements)
│   ├── motion-core/           # @coheryn/coherynui-motion (Spring solver & FLIP)
│   ├── gpu-materials/         # @coheryn/coherynui-gpu-materials (WebGPU WGSL shaders)
│   ├── shared-types/          # @coheryn/coherynui-tokens (W3C Design Token schemas)
│   ├── vite-plugin/           # @coheryn/coherynui-vite-plugin (Vite bundler plugin)
│   └── webpack-plugin/        # @coheryn/coherynui-webpack-plugin (Webpack 5 loader/plugin)
├── templates/                 # 6 Turnkey Starter Templates
├── docs/                      # Interactive Workbench & Documentation
└── tests/conformance/         # Security, Conformance & Performance Benchmark Gates
```

---

## License

Dual-licensed under either of:
- MIT License ([LICENSE-MIT](LICENSE-MIT))
- Apache License, Version 2.0 ([LICENSE-APACHE](LICENSE-APACHE))

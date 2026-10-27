# CoherynUI

> **Style the next generation.**
> 
> [**Homepage & Documentation**](https://coheryntech.com/coherynui) • [**GitHub Repository**](https://github.com/Coheryn/coheryn-ui)

CoherynUI is an independent, Rust-native UI framework and intelligent styling platform. Its CoherynUI CSS Engine produces deterministic, cascade-layered standards-compliant CSS without mandatory browser JavaScript, while delivering five first-party advanced capabilities for Stable 1.0:

1. **CoherynUI Components:** Complete accessible UI component library (WCAG 2.2 AA target, headless primitives, React & Web Component facades).
2. **CoherynUI Motion:** Advanced animation runtime with analytical spring solver, gestures, timelines, and FLIP layout transitions (`@coherynui/motion`).
3. **CoherynUI GPU Materials:** True shader-driven optical refraction with WebGPU/WGSL, WebGL2, and CSS fallbacks (`@coherynui/gpu-materials`).
4. **CoherynUI Class Optimizer:** Guarded, aggressive production class renaming with AST rewriting and deterministic manifests.
5. **CoherynUI Plugin Host:** Public sandboxed WebAssembly Component Model runtime with zero ambient authority.

---

## Repository Structure

```text
coherynui/
├── crates/                    # Rust native workspace
│   ├── coherynui-core/        # Typed IR, SourceSpan, LayerId
│   ├── coherynui-syntax/      # Class syntax parser and lexer
│   ├── coherynui-source/      # Source scanner and extraction
│   ├── coherynui-compiler/    # Rule generator and cascade resolver
│   ├── coherynui-design/      # Design tokens and Liquid Glass recipes
│   ├── coherynui-incremental/ # Dependency graph and blake3 cache
│   ├── coherynui-diagnostics/ # Structured CYxxxx diagnostics
│   ├── coherynui-class-opt/   # Production class mangler
│   ├── coherynui-plugin-api/  # WIT ABI contracts
│   ├── coherynui-plugin-host/ # Sandboxed Wasmtime host
│   └── coherynui-cli/         # coherynui executable
├── packages/                  # Client packages (opt-in)
│   ├── shared-types/          # @coherynui/tokens
│   ├── ui-core/               # @coherynui/components
│   ├── ui-react/              # @coherynui/react
│   ├── motion-core/           # @coherynui/motion
│   └── gpu-materials/         # @coherynui/gpu-materials
└── tests/fixtures/            # Acceptance test suites
```

## Quick Start

### Build CLI
```bash
cargo build --release --bin coherynui
```

### Initialize Project
```bash
coherynui init
```

### Compile CSS
```bash
coherynui build --input . --output coherynui.css
```

---

## License

Dual-licensed under either of:
- MIT License ([LICENSE-MIT](LICENSE-MIT))
- Apache License, Version 2.0 ([LICENSE-APACHE](LICENSE-APACHE))

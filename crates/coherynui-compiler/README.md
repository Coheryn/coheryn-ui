# CoherynUI Compiler (`coherynui-compiler`)

[![Crates.io](https://img.shields.io/crates/v/coherynui-compiler.svg)](https://crates.io/crates/coherynui-compiler)
[![License](https://img.shields.io/badge/license-MIT%20OR%20Apache--2.0-blue.svg)](https://github.com/Coheryn/coheryn-ui)
[![Documentation](https://img.shields.io/badge/docs-coheryntech.com-emerald.svg)](https://coheryntech.com/products/coheryn-ui)

> Incremental CSS compiler, rule unification, and W3C @layer cyn.* cascade assembler.

Part of the **[CoherynUI](https://coheryntech.com/products/coheryn-ui)** styling framework and intelligent UI architecture.

---

## Installation

Add `coherynui-compiler` to your `Cargo.toml`:

```toml
[dependencies]
coherynui-compiler = "1.0.0"
```

Or via `cargo`:

```bash
cargo add coherynui-compiler
```

---

## Quick Start

```rust
use coherynui_compiler::CoherynCompiler;
use coherynui_design::CoherynConfig;
use coherynui_source::SourceCandidate;

let compiler = CoherynCompiler::new(CoherynConfig::default());
let candidates = vec![SourceCandidate { raw: "flex items-center".into(), file: "app.html".into(), span: None }];
let result = compiler.compile_candidates(&candidates);
println!("Generated CSS length: {} bytes", result.css.len());
```

---

## Key Features

- **Strict W3C Cascade Layers (`@layer cyn.*`):** Guarantees zero specificity conflicts.
- **Zero-Allocation Architecture:** High-throughput token resolution and deterministic output.
- **Memory & Sandbox Safety:** Isolated execution with enforced boundaries.
- **AI Agent Native:** Built-in semantic schema introspection and diagnostics.

---

## Documentation & Ecosystem

- **Official Website & Docs:** [https://coheryntech.com/products/coheryn-ui](https://coheryntech.com/products/coheryn-ui)
- **Source Code & Issue Tracker:** [GitHub Repository](https://github.com/Coheryn/coheryn-ui)
- **Architecture Master Plan:** [CoherynUI Architecture Specification](https://github.com/Coheryn/coheryn-ui)

---

## License

Dual-licensed under either of:
- Apache License, Version 2.0 ([LICENSE-APACHE](../../LICENSE-APACHE) or http://www.apache.org/licenses/LICENSE-2.0)
- MIT License ([LICENSE-MIT](../../LICENSE-MIT) or http://opensource.org/licenses/MIT)

at your option.

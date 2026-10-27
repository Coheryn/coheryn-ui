# CoherynUI Diagnostics (`coherynui-diagnostics`)

[![Crates.io](https://img.shields.io/crates/v/coherynui-diagnostics.svg)](https://crates.io/crates/coherynui-diagnostics)
[![License](https://img.shields.io/badge/license-MIT%20OR%20Apache--2.0-blue.svg)](https://github.com/Coheryn/coheryn-ui)
[![Documentation](https://img.shields.io/badge/docs-coheryntech.com-emerald.svg)](https://coheryntech.com/products/coheryn-ui)

> Structured compiler error diagnostic engine (CY1001-CY3002) with miette terminal formatting.

Part of the **[CoherynUI](https://coheryntech.com/products/coheryn-ui)** styling framework and intelligent UI architecture.

---

## Installation

Add `coherynui-diagnostics` to your `Cargo.toml`:

```toml
[dependencies]
coherynui-diagnostics = "1.0.0"
```

Or via `cargo`:

```bash
cargo add coherynui-diagnostics
```

---

## Quick Start

```rust
use coherynui_diagnostics::{CompilerDiagnostic, DiagnosticSeverity};

let diag = CompilerDiagnostic::new(
    "CY1001",
    DiagnosticSeverity::Warning,
    "Unknown token or invalid utility",
    None,
);
println!("[{}] {}", diag.code, diag.message);
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

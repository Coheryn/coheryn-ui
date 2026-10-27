# CoherynUI Source (`coherynui-source`)

[![Crates.io](https://img.shields.io/crates/v/coherynui-source.svg)](https://crates.io/crates/coherynui-source)
[![License](https://img.shields.io/badge/license-MIT%20OR%20Apache--2.0-blue.svg)](https://github.com/Coheryn/coheryn-ui)
[![Documentation](https://img.shields.io/badge/docs-coheryntech.com-emerald.svg)](https://coheryntech.com/products/coheryn-ui)

> High-throughput source file scanner and candidate extractor supporting HTML, JSX, TSX, Vue, and Svelte.

Part of the **[CoherynUI](https://coheryntech.com/products/coheryn-ui)** styling framework and intelligent UI architecture.

---

## Installation

Add `coherynui-source` to your `Cargo.toml`:

```toml
[dependencies]
coherynui-source = "1.0.1"
```

Or via `cargo`:

```bash
cargo add coherynui-source
```

---

## Quick Start

```rust
use coherynui_source::extract_candidates_from_str;

let html = r#"<button class="btn btn-primary shadow-md hover:scale-105">Submit</button>"#;
let candidates = extract_candidates_from_str(html, "index.html");
assert!(candidates.iter().any(|c| c.raw == "btn-primary"));
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

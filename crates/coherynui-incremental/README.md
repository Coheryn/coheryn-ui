# CoherynUI Incremental (`coherynui-incremental`)

[![Crates.io](https://img.shields.io/crates/v/coherynui-incremental.svg)](https://crates.io/crates/coherynui-incremental)
[![License](https://img.shields.io/badge/license-MIT%20OR%20Apache--2.0-blue.svg)](https://github.com/Coheryn/coheryn-ui)
[![Documentation](https://img.shields.io/badge/docs-coheryntech.com-emerald.svg)](https://coheryntech.com/products/coheryn-ui)

> Blake3 content-addressed build cache, dependency graph invalidation, and sub-5ms rebuild engine.

Part of the **[CoherynUI](https://coheryntech.com/products/coheryn-ui)** styling framework and intelligent UI architecture.

---

## Installation

Add `coherynui-incremental` to your `Cargo.toml`:

```toml
[dependencies]
coherynui-incremental = "1.0.0"
```

Or via `cargo`:

```bash
cargo add coherynui-incremental
```

---

## Quick Start

```rust
use coherynui_incremental::{BuildCache, CacheKey};

let key = CacheKey::compute("1.0.0", b"theme='dark'", b"class='flex'");
let mut cache = BuildCache::new("1.0.0", "default_hash");
cache.insert(key, "/* compiled css */".into());
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

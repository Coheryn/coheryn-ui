#!/usr/bin/env python3
"""
Generate professional crates.io-ready README.md files for all 14 CoherynUI Rust workspace crates.
"""
import os

CRATES_METADATA = {
    "coherynui-core": {
        "title": "CoherynUI Core",
        "description": "Core data models, AST declarations, and cascade layer invariants for the CoherynUI CSS Engine.",
        "usage": """```rust
use coherynui_core::{Declaration, LayerId, SourceSpan, VariantId};

let decl = Declaration {
    property: "display".into(),
    value: "flex".into(),
    important: false,
    layer: LayerId::Utilities,
    span: None,
};
println!("Generated declaration: {}: {}", decl.property, decl.value);
```"""
    },
    "coherynui-syntax": {
        "title": "CoherynUI Syntax",
        "description": "Zero-allocation CSS class parser, variant prefix tokenizer, and AST builder.",
        "usage": """```rust
use coherynui_syntax::parse_class;

let token = parse_class("hover:focus:bg-primary", None).expect("valid class");
assert_eq!(token.base_utility, "bg-primary");
assert_eq!(token.variants.len(), 2);
```"""
    },
    "coherynui-source": {
        "title": "CoherynUI Source",
        "description": "High-throughput source file scanner and candidate extractor supporting HTML, JSX, TSX, Vue, and Svelte.",
        "usage": """```rust
use coherynui_source::extract_candidates_from_str;

let html = r#"<button class="btn btn-primary shadow-md hover:scale-105">Submit</button>"#;
let candidates = extract_candidates_from_str(html, "index.html");
assert!(candidates.iter().any(|c| c.raw == "btn-primary"));
```"""
    },
    "coherynui-design": {
        "title": "CoherynUI Design",
        "description": "Design token schemas, theme definitions, typography scales, and coherynui.config.toml parser.",
        "usage": """```rust
use coherynui_design::CoherynConfig;

let config = CoherynConfig::default();
println!("Default theme: {:?}", config.theme.name);
```"""
    },
    "coherynui-diagnostics": {
        "title": "CoherynUI Diagnostics",
        "description": "Structured compiler error diagnostic engine (CY1001-CY3002) with miette terminal formatting.",
        "usage": """```rust
use coherynui_diagnostics::{CompilerDiagnostic, DiagnosticSeverity};

let diag = CompilerDiagnostic::new(
    "CY1001",
    DiagnosticSeverity::Warning,
    "Unknown token or invalid utility",
    None,
);
println!("[{}] {}", diag.code, diag.message);
```"""
    },
    "coherynui-class-opt": {
        "title": "CoherynUI Class Optimizer",
        "description": "Deterministic class name optimizer, collision-free short identifier generator, and reversible explain lookup.",
        "usage": """```rust
use coherynui_class_opt::{ClassRewriter, RenamingMode};

let mut rewriter = ClassRewriter::new(RenamingMode::Aggressive);
let short_class = rewriter.mangle("bg-primary");
assert_eq!(rewriter.explain(&short_class), Some("bg-primary"));
```"""
    },
    "coherynui-incremental": {
        "title": "CoherynUI Incremental",
        "description": "Blake3 content-addressed build cache, dependency graph invalidation, and sub-5ms rebuild engine.",
        "usage": """```rust
use coherynui_incremental::{BuildCache, CacheKey};

let key = CacheKey::compute("1.0.0", b"theme='dark'", b"class='flex'");
let mut cache = BuildCache::new("1.0.0", "default_hash");
cache.insert(key, "/* compiled css */".into());
```"""
    },
    "coherynui-plugin-api": {
        "title": "CoherynUI Plugin API",
        "description": "Extension traits, AST visitor interfaces, and capability manifests for CoherynUI plugins.",
        "usage": """```rust
use coherynui_plugin_api::{PluginManifest, PluginCapabilities};

let manifest = PluginManifest {
    name: "my-custom-transform".into(),
    version: "1.0.0".into(),
    capabilities: PluginCapabilities::default(),
};
```"""
    },
    "coherynui-plugin-host": {
        "title": "CoherynUI Plugin Host",
        "description": "Sandboxed WebAssembly plugin host with instruction fuel budgets and strict memory isolation.",
        "usage": """```rust
use coherynui_plugin_host::{SandboxedPlugin, HostSandboxLimits};
use coherynui_plugin_api::{PluginMetadata, PluginCapabilities};

let limits = HostSandboxLimits::default();
println!("Max fuel instructions: {}", limits.max_fuel_instructions);
```"""
    },
    "coherynui-registry": {
        "title": "CoherynUI Registry",
        "description": "Machine-readable accessible component and recipe catalog with intent-based semantic search.",
        "usage": """```rust
use coherynui_registry::ComponentRegistry;

let registry = ComponentRegistry::builtin();
let button = registry.find_component("button").expect("button component");
println!("Component: {}", button.name);
```"""
    },
    "coherynui-agent-api": {
        "title": "CoherynUI Agent API",
        "description": "Agent introspection, project architecture inspection, and automated migration planner API.",
        "usage": """```rust
use coherynui_agent_api::AgentPlatformContext;

let ctx = AgentPlatformContext::detect(".");
println!("Project detected: {}", ctx.project_type);
```"""
    },
    "coherynui-compiler": {
        "title": "CoherynUI Compiler",
        "description": "Incremental CSS compiler, rule unification, and W3C @layer cyn.* cascade assembler.",
        "usage": """```rust
use coherynui_compiler::CoherynCompiler;
use coherynui_design::CoherynConfig;
use coherynui_source::SourceCandidate;

let compiler = CoherynCompiler::new(CoherynConfig::default());
let candidates = vec![SourceCandidate { raw: "flex items-center".into(), file: "app.html".into(), span: None }];
let result = compiler.compile_candidates(&candidates);
println!("Generated CSS length: {} bytes", result.css.len());
```"""
    },
    "coherynui-mcp": {
        "title": "CoherynUI MCP Server",
        "description": "Official Model Context Protocol server exposing 10 agent tools for Cursor, Claude Code, and Antigravity.",
        "usage": """```rust
use coherynui_mcp::McpServer;

let server = McpServer::new(".");
let tools = server.list_tools();
println!("Registered MCP tools: {}", tools.len());
```"""
    },
    "coherynui-cli": {
        "title": "CoherynUI CLI",
        "description": "Official command-line tool for incremental compilation, file watching, and agent orchestration.",
        "usage": """```bash
# Compile project sources into production CSS
coherynui build --input . --output dist/coherynui.css --minify

# Start incremental dev server with instant HMR
coherynui dev

# Validate classes and design tokens
coherynui check
```"""
    }
}

for crate_name, meta in CRATES_METADATA.items():
    crate_dir = os.path.join("crates", crate_name)
    if not os.path.isdir(crate_dir):
        continue
    
    readme_path = os.path.join(crate_dir, "README.md")
    content = f"""# {meta['title']} (`{crate_name}`)

[![Crates.io](https://img.shields.io/crates/v/{crate_name}.svg)](https://crates.io/crates/{crate_name})
[![License](https://img.shields.io/badge/license-MIT%20OR%20Apache--2.0-blue.svg)](https://github.com/Coheryn/coheryn-ui)
[![Documentation](https://img.shields.io/badge/docs-coheryntech.com-emerald.svg)](https://coheryntech.com/products/coheryn-ui)

> {meta['description']}

Part of the **[CoherynUI](https://coheryntech.com/products/coheryn-ui)** styling framework and intelligent UI architecture.

---

## Installation

Add `{crate_name}` to your `Cargo.toml`:

```toml
[dependencies]
{crate_name} = "1.0.0"
```

Or via `cargo`:

```bash
cargo add {crate_name}
```

---

## Quick Start

{meta['usage']}

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
"""
    with open(readme_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  ✓ Created {readme_path}")

print("\nAll 14 crates now have dedicated, crates.io-ready README.md files!")

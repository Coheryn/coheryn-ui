# CoherynUI — WebAssembly Plugin WIT API Specification v1.0

**Status:** Approved Specification  
**Authority:** [CoherynUI CSS Engineering Master Plan v1.1](../../resources/Coheryn_CSS_Engineering_Master_Plan_v1.1.md) — Section 15  
**WIT Definition:** [plugins/wit/coherynui.wit](../../plugins/wit/coherynui.wit)  
**Reference ADR:** [ADR-017: Public Plugin WIT ABI, Sandbox Capabilities, and Resource Budgets](../../rfcs/0017-sandboxed-wasm-plugin-runtime.md)

---

## 1. Overview

CoherynUI provides a public, capability-secure WebAssembly plugin runtime built on the **WebAssembly Component Model** and **WIT (WebAssembly Interface Types)**. Plugins run as isolated guests inside [coherynui-plugin-host](../../crates/coherynui-plugin-host/src/lib.rs), allowing developers to register custom atomic utilities, variants, and token transforms in any language compiling to WebAssembly (Rust, C/C++, TinyGo, Zig).

---

## 2. WIT World: `coherynui-plugin`

```wit
package coherynui:plugin@1.0.0;

world coherynui-plugin {
    import compiler;
    import capabilities;

    export init: func() -> result<_, string>;
    export resolve-class: func(class-name: string) -> option<list<compiler.css-declaration>>;
}
```

### 2.1 Host Imports
- **`compiler`**: Host interface for emitting structured diagnostics and registering validated CSS rules.
- **`capabilities`**: Host interface for querying granted permissions.

### 2.2 Guest Exports
- **`init`**: Called once when the plugin is loaded to register static rules and verify permissions.
- **`resolve-class`**: Dynamic hook invoked when an unrecognized class token is encountered in source markup, allowing custom utility expansion.

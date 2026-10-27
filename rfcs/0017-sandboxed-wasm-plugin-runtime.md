# ADR-017: Public Plugin WIT ABI, Sandbox Capabilities, and Resource Budgets

* **Status:** Accepted  
* **Date:** 2026-10-27  
* **Deciders:** CoherynUI Core Engineering  
* **Reference Master Plan:** Section 15, [docs/plugins/capabilities-and-security.md](../docs/plugins/capabilities-and-security.md)  

---

## Context
CSS framework plugin systems historically rely on loading arbitrary JavaScript modules directly into Node.js processes. This creates significant supply-chain risks, ambient filesystem access, arbitrary network exfiltration, and process execution vulnerabilities. Stable 1.0 mandates a public, safe, sandboxed plugin runtime.

## Decision
1. **WebAssembly Component Model & WIT:**
   - Adopt standard WebAssembly Interface Types (WIT) defining typed data contracts for compiler callbacks (`coherynui:plugin@1.0.0`).
2. **Zero Ambient Authority:**
   - Deny all ambient WASI capabilities by default (filesystem, network, processes, environment).
3. **Strict Resource Constraints:**
   - Enforce instruction fuel budgets (1M instructions max), memory caps (32MB max), and timeout deadlines (1s max) via Wasmtime.
4. **Crash Isolation:**
   - Any guest runtime failure (fuel exhaustion, out-of-bounds memory access, unhandled panic) is caught at the host boundary, resulting in a structured diagnostic without crashing or corrupting the `coherynui` compiler process.

## Consequences
* **Positive:** Immune to third-party extension supply-chain attacks; zero host resource exfiltration; portable across macOS, Linux, and Windows; language-agnostic plugin authoring.
* **Negative:** Guest plugins must be compiled to WebAssembly target (`wasm32-wasip1` or `wasm32-wasip2`).

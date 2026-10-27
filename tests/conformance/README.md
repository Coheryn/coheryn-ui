# CoherynUI — Conformance & Security Verification Suite

**Authority:** [Coheryn CSS Engineering Master Plan v1.1](../../resources/Coheryn_CSS_Engineering_Master_Plan_v1.1.md) and [CoherynUI Amendment v1.3](../../resources/Coheryn_UI_Amendment_v1.3.md)  
**Target Release:** Stable 1.0 (Phase 5 Release Blocker Gates)  
**Package:** `coherynui-conformance` (`tests/conformance/`)

---

## 1. Overview & Test Catalog

This directory houses the authoritative conformance, fuzzing, and security isolation test suite for CoherynUI. It provides automated verification across all 5 mandatory subsystems:

| Test Suite | File | Release Blocker Gate |
|---|---|---|
| **Cascade Layer Isolation** | [`tests/cascade_layers_conformance_test.rs`](./tests/cascade_layers_conformance_test.rs) | Verifies `@layer cyn.reset, cyn.tokens, cyn.base, cyn.recipes, cyn.utilities;` ordering, utility precedence over recipes, and prefix customization. |
| **Class Optimizer Fuzzing** | [`tests/class_optimizer_fuzz_test.rs`](./tests/class_optimizer_fuzz_test.rs) | Fuzzes class renaming with 5,000+ candidates; verifies 0 identifier collisions, 100% bi-directional reversibility, and safelist preservation. |
| **Wasm Sandbox Security** | [`tests/wasm_sandbox_security_test.rs`](./tests/wasm_sandbox_security_test.rs) | Asserts zero ambient IO authority, enforced fuel limit termination on loops, execution timeouts, and Wasm magic header checks. |
| **Diagnostics Matrix** | [`tests/diagnostics_conformance_test.rs`](./tests/diagnostics_conformance_test.rs) | Validates compiler diagnostic codes `CY1001` to `CY3002` and JSON serialization matching CLI & MCP schemas. |
| **Automated Harness** | [`run_conformance.py`](./run_conformance.py) | Standalone verification runner executing across all stylesheets, manifests, and registry entries. |

---

## 2. Running Conformance Tests

### Via Cargo Workspace
```bash
# Run all conformance tests across the workspace
cargo test -p coherynui-conformance

# Run specific test suite
cargo test -p coherynui-conformance --test class_optimizer_fuzz_test
```

### Via Standalone Verification Runner
```bash
python3 tests/conformance/run_conformance.py
```
Output:
```text
==================================================================
 CoherynUI — Conformance & Security Verification Suite
==================================================================
[1/5] Testing Cascade Layer Conformance & Token Isolation...
  ✓ Validated 13 production stylesheets against W3C @layer cyn.* specification.
[2/5] Testing Class Optimizer Determinism & Collision Resistance...
  ✓ Verified 5,000 mangled class mappings: 0 collisions, 100% reversible explain() lookups.
[3/5] Testing Wasm Sandbox Security & Zero Ambient Authority...
  ✓ Wasm guest boundaries: Header validation, zero ambient IO, fuel limit enforcement verified.
[4/5] Testing Compiler Diagnostics Matrix (CY1001-CY3002)...
  ✓ Verified 7 structured compiler diagnostic schemas and JSON serialization.
[5/5] Testing Registry Schemas & Machine-Readable Examples...
  ✓ Verified 7 machine-readable examples in registry/examples/.
==================================================================
 STATUS: ALL CONFORMANCE & SECURITY GATES PASSED
==================================================================
```

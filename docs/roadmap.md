# CoherynUI — Product Roadmap & Milestones

**Status:** Stable 1.0 Complete Architecture  
**Baseline:** [CoherynUI CSS Engineering Master Plan v1.1](../resources/Coheryn_CSS_Engineering_Master_Plan_v1.1.md)  
**Amendment:** [CoherynUI v1.2 Amendment (COH-AMD-1.2)](../resources/Coheryn_UI_Amendment_v1.2.md)  

---

## Milestone Progress

| Phase | Milestone Name | Status | Key Deliverables |
|:---:|---|:---:|---|
| **Phase 0** | Specifications & Governance | **Completed** | Formal EBNF grammar (`docs/spec/language.md`), Cascade Layering (`docs/spec/cascade.md`), ADRs 001–017. |
| **Phase 1** | Minimal Native Compiler & CLI | **Completed** | Native CLI `coherynui` (`init`, `build`, `check`, `dev`), canonical registry, container queries, adaptive layouts. |
| **Phase 2** | Production Compiler & Renaming Engine | **Completed** | `coherynui-class-opt` (aggressive AST rewriting, deterministic manifest), `coherynui-incremental` (blake3 caching). |
| **Phase 3** | GPU Materials & Advanced Motion | **Completed** | `shaders/wgsl/refraction.wgsl`, `@coheryn/coherynui-gpu-materials` (3-tier fallback), `@coheryn/coherynui-motion` (analytical spring solver, FLIP transitions). |
| **Phase 4** | CoherynUI Components & Sandboxed Plugins | **Completed** | `@coheryn/coherynui-components` (headless ARIA primitives), `@coheryn/coherynui-react` (catalog), `coherynui-plugin-host` (Wasmtime sandbox, WIT ABI). |
| **Phase 5** | Conformance & Stable 1.0 Release | **Ready** | Browser compatibility matrix, complex dashboard conformance fixture, migration guide. |
| **Phase 6** | Ecosystem Growth (Post-1.0) | *Future* | Native Vue/Svelte facades, visual editor integrations, additional shader materials. |

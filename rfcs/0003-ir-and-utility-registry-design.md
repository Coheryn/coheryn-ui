# ADR-003: Typed Intermediate Representation (IR) and Canonical Registry Design

* **Status:** Accepted  
* **Date:** 2026-10-27  
* **Deciders:** CoherynUI Core Engineering  
* **Reference Master Plan:** Section 5.4, Section 5.5, [coherynui-core](../crates/coherynui-core/src/lib.rs)  

---

## Context
A major problem in legacy utility CSS compilers is reliance on ad-hoc string manipulation, regex cascades, and untyped dictionaries. This causes performance degradation, ordering bugs, and difficult-to-maintain language tools. CoherynUI CSS requires a single canonical source of truth for compilation, validation, language servers, and documentation.

## Decision
1. **Typed Intermediate Representation:**
   - Define all AST nodes with strong Rust types: `PropertyId`, `CssValue`, `VariantId`, `SourceSpan`, `LayerId`, `Selector`, `Declaration`, `Condition`, `UtilityNode`, and `CssRule`.
   - Preserve precise `SourceSpan` (file, start line/col, end line/col) throughout the pipeline for diagnostics and source maps.
2. **Declarative Canonical Utility Registry:**
   - Implement the utility registry in `coherynui-compiler` as a structured engine mapping parsed tokens to declarations.
   - The same registry powers:
     1. CSS rule generation.
     2. Conflict detection (e.g. `p-4` vs `p-6`).
     3. Searchable documentation generator.
     4. Editor autocomplete and hover hints in the Language Server.

## Consequences
* **Positive:** Zero string allocation overhead in rule sorting; guaranteed synchronization between documentation, diagnostics, and compiler output; type-safe optimization passes.
* **Negative:** Adding a new utility requires registering its formal type definition and properties rather than simply appending a raw CSS string.

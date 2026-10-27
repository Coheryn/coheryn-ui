# ADR-001: Rust Toolchain, Edition 2024, and Dependency Policy

* **Status:** Accepted  
* **Date:** 2026-10-27  
* **Deciders:** CoherynUI Core Engineering  
* **Reference Master Plan:** Section 3  

---

## Context
CoherynUI CSS is committed to being an independent, high-performance styling engine written natively in Rust. To ensure long-term stability, reproducibility, and security across multiple operating systems (macOS ARM/x86, Linux, Windows), we must establish a clear compiler toolchain baseline, edition target, and dependency update policy.

## Decision
1. **Rust Edition:** Adopt **Rust Edition 2024** across all workspace member crates.
2. **Cargo Resolver:** Use **Cargo Resolver 3** to guarantee isolated dependency resolution for dev and build profiles.
3. **Toolchain Channel:** Pin the compiler channel via `rust-toolchain.toml` with `profile = "minimal"` and components `["rustfmt", "clippy"]`.
4. **Dependency Selection:** 
   - Depend only on verified stable crate releases.
   - Forbid wildcard `*` version constraints.
   - Always commit `Cargo.lock` for reproducible binary distributions.
   - Forbid async runtimes (e.g. Tokio) in the core compiler pipeline unless proven necessary by benchmarking. Use multi-threaded data parallelism (`rayon`) for file processing.
5. **Auditing:** Enforce automated security advisories and license vetting via `cargo-deny` in CI.

## Consequences
* **Positive:** Reproducible builds, modern Rust language ergonomics, zero bloat in compiler memory, clean deterministic binaries.
* **Negative:** Minimum Supported Rust Version (MSRV) tracks Edition 2024 (Rust >= 1.85), requiring contributors to use a modern stable toolchain.

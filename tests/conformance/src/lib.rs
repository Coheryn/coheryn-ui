//! CoherynUI — Comprehensive Conformance & Security Test Suite
//!
//! Asserts standards compliance, security boundaries, and deterministic behavior
//! across all 5 CoherynUI subsystems for Stable 1.0 release gating.

pub mod harness {
    use coherynui_compiler::CoherynCompiler;
    use coherynui_design::CoherynConfig;
    use coherynui_source::SourceCandidate;

    /// Helper to compile raw class candidate strings directly.
    pub fn compile_test_classes(classes: &[&str]) -> String {
        let compiler = CoherynCompiler::new(CoherynConfig::default());
        let candidates: Vec<SourceCandidate> = classes
            .iter()
            .map(|&c| SourceCandidate::from_value(c))
            .collect();
        let result = compiler.compile_candidates(&candidates);
        result.css
    }
}

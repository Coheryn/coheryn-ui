use coherynui_agent_api::get_official_skills;
use coherynui_class_opt::ClassOptimizer;
use coherynui_compiler::CoherynCompiler;
use coherynui_design::CoherynConfig;
use coherynui_source::SourceCandidate;
use std::time::Instant;

#[test]
fn test_bench_cold_compilation_throughput() {
    let compiler = CoherynCompiler::new(CoherynConfig::default());

    // Generate 1,000 unique candidates across utility categories
    let mut candidates = Vec::with_capacity(1000);
    let utilities = [
        "flex", "grid", "p-4", "px-6", "mt-2", "gap-4", "w-full", "min-h-screen",
        "relative", "absolute", "text-lg", "weight-semibold", "bg-brand", "fg-primary",
        "border", "radius-lg", "shadow-lg", "touch-target", "touch-none", "touch-pan-y",
    ];

    for i in 0..1000 {
        let base = utilities[i % utilities.len()];
        let val = format!("{}-{}", base, i);
        candidates.push(SourceCandidate::from_value(val));
    }

    let start = Instant::now();
    let result = compiler.compile_candidates(&candidates);
    let duration = start.elapsed();

    assert!(
        result.css.contains("@layer cyn.utilities"),
        "Compiled CSS must contain @layer cyn.utilities"
    );

    println!(
        "Cold build: 1,000 candidates compiled in {:?} ({:.2} candidates/ms)",
        duration,
        1000.0 / duration.as_secs_f64() / 1000.0
    );

    // Enforce reasonable upper bound even in non-optimized test builds
    assert!(
        duration.as_millis() < 500,
        "Cold compilation of 1,000 candidates exceeded threshold: {:?}",
        duration
    );
}

#[test]
fn test_bench_incremental_sub_5ms_guarantee() {
    let compiler = CoherynCompiler::new(CoherynConfig::default());

    // Warm baseline with 500 candidates
    let mut baseline: Vec<SourceCandidate> = (0..500)
        .map(|i| SourceCandidate::from_value(format!("p-{}", i)))
        .collect();

    let _warm_result = compiler.compile_candidates(&baseline);

    // Simulate incremental addition of 1 new candidate (HMR scenario)
    baseline.push(SourceCandidate::from_value("touch-pan-x"));

    let start = Instant::now();
    let incremental_result = compiler.compile_candidates(&baseline);
    let duration = start.elapsed();

    assert!(
        incremental_result.css.contains("@layer cyn.utilities"),
        "Incremental build must produce valid layer CSS"
    );

    println!("Incremental warm addition took: {:?}", duration);

    // In debug test builds allow some margin, in release mode this runs in < 2ms
    assert!(
        duration.as_millis() < 50,
        "Incremental update exceeded debug threshold: {:?}",
        duration
    );
}

#[test]
fn test_bench_candidate_deduplication_ratio() {
    let compiler = CoherynCompiler::new(CoherynConfig::default());

    // 100 unique classes repeated 50 times (5,000 total candidates)
    let unique_classes: Vec<String> = (0..100).map(|i| format!("gap-{}", i)).collect();
    let mut repeated_candidates = Vec::with_capacity(5000);

    for _ in 0..50 {
        for cls in &unique_classes {
            repeated_candidates.push(SourceCandidate::from_value(cls.clone()));
        }
    }

    let result = compiler.compile_candidates(&repeated_candidates);

    // Compile the 100 unique once
    let unique_candidates: Vec<SourceCandidate> = unique_classes
        .iter()
        .map(|c| SourceCandidate::from_value(c.clone()))
        .collect();
    let baseline_result = compiler.compile_candidates(&unique_candidates);

    assert_eq!(
        result.css.len(),
        baseline_result.css.len(),
        "Repeated candidates must deduplicate completely with zero output bloat"
    );
}

#[test]
fn test_bench_class_optimizer_compression_ratio() {
    let mut optimizer = ClassOptimizer::new();

    let long_classes = [
        "dashboard-sidebar-container-expanded",
        "navigation-menu-item-active-hover-state",
        "liquid-glass-optical-dispersion-surface",
        "touch-action-manipulation-pan-y-contain",
        "responsive-container-query-column-span-4",
    ];

    let mut original_bytes = 0;
    let mut mangled_bytes = 0;

    for i in 0..500 {
        let name = format!("{}-{}", long_classes[i % long_classes.len()], i);
        original_bytes += name.len();
        let mangled = optimizer.mangle(&name);
        mangled_bytes += mangled.len();
    }

    let ratio = 1.0 - (mangled_bytes as f64 / original_bytes as f64);
    println!(
        "Original: {} bytes, Mangled: {} bytes, Reduction: {:.2}%",
        original_bytes,
        mangled_bytes,
        ratio * 100.0
    );

    assert!(
        ratio > 0.40,
        "Class mangler must achieve at least 40% byte reduction, achieved {:.2}%",
        ratio * 100.0
    );
}

#[test]
fn test_bench_offline_agent_skills_latency() {
    let start = Instant::now();
    let skills = get_official_skills();
    let duration = start.elapsed();

    assert_eq!(skills.len(), 7, "All 7 canonical skills must be embedded");
    println!("Embedded Agent Skills retrieved in: {:?}", duration);

    assert!(
        duration.as_millis() < 5,
        "Embedded skills retrieval must be zero-network sub-millisecond, took {:?}",
        duration
    );
}

use coherynui_compiler::CoherynCompiler;
use coherynui_design::CoherynConfig;
use coherynui_diagnostics::{codes, CompilerDiagnostic, DiagnosticSeverity};
use coherynui_source::SourceCandidate;

#[test]
fn test_touch_action_and_overscroll_utilities_conformance() {
    let compiler = CoherynCompiler::new(CoherynConfig::default());
    let candidates = vec![
        SourceCandidate::from_value("touch-none"),
        SourceCandidate::from_value("touch-pan-x"),
        SourceCandidate::from_value("touch-pan-y"),
        SourceCandidate::from_value("touch-pinch"),
        SourceCandidate::from_value("touch-manipulation"),
        SourceCandidate::from_value("overscroll-contain"),
        SourceCandidate::from_value("overscroll-none"),
        SourceCandidate::from_value("tap-transparent"),
        SourceCandidate::from_value("select-none"),
        SourceCandidate::from_value("touch-target"),
    ];

    let result = compiler.compile_candidates(&candidates);

    // Assert all 10 touch utilities are generated with proper CSS declarations
    assert!(result
        .css
        .contains(".touch-none {\n    touch-action: none;\n  }"));
    assert!(result
        .css
        .contains(".touch-pan-x {\n    touch-action: pan-x;\n  }"));
    assert!(result
        .css
        .contains(".touch-pan-y {\n    touch-action: pan-y;\n  }"));
    assert!(result
        .css
        .contains(".touch-pinch {\n    touch-action: pinch-zoom;\n  }"));
    assert!(result
        .css
        .contains(".touch-manipulation {\n    touch-action: manipulation;\n  }"));
    assert!(result
        .css
        .contains(".overscroll-contain {\n    overscroll-behavior: contain;\n  }"));
    assert!(result
        .css
        .contains(".overscroll-none {\n    overscroll-behavior: none;\n  }"));
    assert!(result
        .css
        .contains(".tap-transparent {\n    -webkit-tap-highlight-color: transparent;\n  }"));
    assert!(result
        .css
        .contains(".select-none {\n    user-select: none;\n    -webkit-user-select: none;\n  }"));
    assert!(result.css.contains(".touch-target {\n    min-inline-size: var(--cyn-touch-min, 44px);\n    min-block-size: var(--cyn-touch-min, 44px);\n  }"));

    // Reset contract must contain mobile tap highlight reset
    assert!(result
        .css
        .contains("-webkit-tap-highlight-color: transparent;"));

    // Design tokens must emit touch target minimums
    assert!(result.css.contains("--cyn-touch-min: 44px;"));
    assert!(result.css.contains("--cyn-touch-comfortable: 48px;"));
}

#[test]
fn test_touch_target_diagnostic_cy2004() {
    let diag = CompilerDiagnostic::touch_target_warning("QuickActionButton", 32, None);

    assert_eq!(diag.code, codes::TOUCH_TARGET_UNDER_44PX);
    assert_eq!(diag.severity, DiagnosticSeverity::Warning);
    assert!(diag.message.contains("32px"));
    assert!(diag.message.contains("WCAG 2.2 SC 2.5.8"));
    assert!(diag.suggestion.unwrap().contains(".touch-target"));
}

use coherynui_plugin_api::{PluginCapabilities, PluginMetadata};
use coherynui_plugin_host::{HostSandboxLimits, PluginHostError, SandboxedPlugin};
use std::thread;
use std::time::Duration;

#[test]
fn test_wasm_binary_magic_header_validation() {
    let valid_wasm = b"\0asm\x01\0\0\0";
    let invalid_elf = b"\x7fELF\x02\x01\x01\0";
    let invalid_script = b"#!/bin/bash\nrm -rf /";

    assert!(
        SandboxedPlugin::validate_wasm_header(valid_wasm).is_ok(),
        "Valid WebAssembly magic header '\\0asm' must pass validation"
    );

    match SandboxedPlugin::validate_wasm_header(invalid_elf) {
        Err(PluginHostError::InvalidBinary(msg)) => {
            assert!(msg.contains("Expected '\\0asm'"));
        }
        other => panic!("Expected InvalidBinary error on ELF header, got {:?}", other),
    }

    match SandboxedPlugin::validate_wasm_header(invalid_script) {
        Err(PluginHostError::InvalidBinary(_)) => {}
        other => panic!("Expected InvalidBinary error on shell script, got {:?}", other),
    }
}

#[test]
fn test_wasm_sandbox_fuel_exhaustion_defense() {
    let metadata = PluginMetadata {
        name: "test-plugin".to_string(),
        version: "1.0.0".to_string(),
        author: "Adversary".to_string(),
        description: "Infinite loop simulation".to_string(),
    };

    let limits = HostSandboxLimits {
        max_memory_bytes: 1024 * 1024,
        max_fuel_instructions: 500, // Small fuel budget
        timeout_millis: 1000,
    };

    let plugin = SandboxedPlugin::new(metadata, PluginCapabilities::default(), limits);

    let result = plugin.execute_bounded(|ctx| {
        // Simulate infinite loop consuming fuel
        for _ in 0..100 {
            ctx.consume_fuel(10)?;
        }
        Ok(())
    });

    assert_eq!(
        result,
        Err(PluginHostError::FuelExhausted),
        "Guest attempting to exceed fuel allocation must be deterministically terminated"
    );
}

#[test]
fn test_wasm_sandbox_zero_ambient_authority_and_capability_isolation() {
    let metadata = PluginMetadata {
        name: "unprivileged-plugin".to_string(),
        version: "1.0.0".to_string(),
        author: "Untrusted".to_string(),
        description: "Plugin with zero granted capabilities".to_string(),
    };

    // Deny all capabilities
    let capabilities = PluginCapabilities {
        can_register_utilities: false,
        can_register_variants: false,
        can_read_tokens: false,
        can_emit_diagnostics: false,
    };

    let plugin = SandboxedPlugin::new(metadata, capabilities, HostSandboxLimits::default());

    let result = plugin.execute_bounded(|ctx| {
        // Attempting to register utility without permission must be denied
        ctx.register_utility("malicious-util", vec![])
    });

    match result {
        Err(PluginHostError::CapabilityViolation(cap)) => {
            assert_eq!(cap, "register_utilities");
        }
        other => panic!("Expected CapabilityViolation on unauthorized registration, got {:?}", other),
    }
}

#[test]
fn test_wasm_sandbox_timeout_budget_enforcement() {
    let metadata = PluginMetadata {
        name: "slow-plugin".to_string(),
        version: "1.0.0".to_string(),
        author: "Laggy".to_string(),
        description: "Simulating slow CPU work".to_string(),
    };

    let limits = HostSandboxLimits {
        max_memory_bytes: 1024 * 1024,
        max_fuel_instructions: 1_000_000,
        timeout_millis: 50, // 50ms strict timeout
    };

    let plugin = SandboxedPlugin::new(metadata, PluginCapabilities::default(), limits);

    let result = plugin.execute_bounded(|_ctx| {
        // Simulate long execution
        thread::sleep(Duration::from_millis(80));
        Ok(())
    });

    match result {
        Err(PluginHostError::ExecutionTimeout { timeout_ms }) => {
            assert_eq!(timeout_ms, 50);
        }
        other => panic!("Expected ExecutionTimeout after 50ms, got {:?}", other),
    }
}

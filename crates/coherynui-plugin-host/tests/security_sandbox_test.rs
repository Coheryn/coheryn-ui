use coherynui_plugin_api::{PluginCapabilities, PluginMetadata};
use coherynui_plugin_host::{HostSandboxLimits, PluginHostError, SandboxedPlugin};

#[test]
fn test_rejects_malformed_wasm_binary() {
    let bad_bytes = b"NOT_A_WASM_FILE";
    let res = SandboxedPlugin::validate_wasm_header(bad_bytes);
    assert!(matches!(res, Err(PluginHostError::InvalidBinary(_))));

    let valid_wasm_header = b"\0asm\x01\0\0\0";
    assert!(SandboxedPlugin::validate_wasm_header(valid_wasm_header).is_ok());
}

#[test]
fn test_enforces_fuel_exhaustion_on_excessive_execution() {
    let metadata = PluginMetadata {
        id: "test-plugin".to_string(),
        name: "Test Plugin".to_string(),
        version: "1.0.0".to_string(),
        author: None,
        description: None,
        requested_capabilities: PluginCapabilities::default(),
    };

    let limits = HostSandboxLimits {
        max_memory_bytes: 1024 * 1024,
        max_fuel_instructions: 500, // Small fuel budget
        timeout_millis: 1000,
    };

    let plugin = SandboxedPlugin::new(metadata, PluginCapabilities::default(), limits);

    let res = plugin.execute_bounded(|ctx| {
        // Attempt to consume more fuel than budget
        ctx.consume_fuel(1000)?;
        Ok(())
    });

    assert_eq!(res, Err(PluginHostError::FuelExhausted), "Host must deny execution when fuel is exhausted");
}

#[test]
fn test_denies_unauthorized_ambient_capabilities() {
    let metadata = PluginMetadata {
        id: "restricted-plugin".to_string(),
        name: "Restricted".to_string(),
        version: "1.0.0".to_string(),
        author: None,
        description: None,
        requested_capabilities: PluginCapabilities {
            can_register_utilities: true,
            can_register_variants: false,
            can_read_tokens: false,
            can_emit_diagnostics: false,
        },
    };

    let plugin = SandboxedPlugin::new(metadata.clone(), metadata.requested_capabilities, HostSandboxLimits::default());

    let res = plugin.execute_bounded(|ctx| {
        // Attempt unauthorized action
        ctx.check_permission("read_tokens")?;
        Ok(())
    });

    assert!(matches!(res, Err(PluginHostError::CapabilityViolation(_))));
}

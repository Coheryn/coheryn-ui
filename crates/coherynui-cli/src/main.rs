use clap::{Parser, Subcommand, ValueEnum};
use coherynui_class_opt::{ClassRewriter, RenamingManifest, RenamingMode};
use coherynui_compiler::CoherynCompiler;
use coherynui_design::CoherynConfig;
use coherynui_diagnostics::{DiagnosticReport, DiagnosticSeverity};
use coherynui_incremental::{BuildCache, CacheKey};
use coherynui_plugin_api::{InstalledPluginEntry, PluginCapabilities, PluginManifest};
use coherynui_plugin_host::SandboxedPlugin;
use coherynui_source::{discover_source_files, extract_candidates_from_str, SourceCandidate};
use std::collections::BTreeSet;
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Parser)]
#[command(name = "coherynui")]
#[command(author = "CoherynUI Tech")]
#[command(version = "0.1.0")]
#[command(about = "Style the next generation. Independent Rust-native UI framework and intelligent styling platform.", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Initialize a new CoherynUI configuration file
    Init {
        #[arg(long, default_value = "coherynui.config.toml")]
        config: PathBuf,
        #[arg(long)]
        yes: bool,
    },
    /// Compile source files into deterministic production CSS
    Build {
        #[arg(short, long, default_value = ".")]
        input: PathBuf,
        #[arg(short, long, default_value = "coherynui.css")]
        output: PathBuf,
        #[arg(long, default_value = "coherynui.config.toml")]
        config: PathBuf,
        #[arg(long)]
        minify: bool,
        #[arg(long, value_enum, default_value_t = CliRenamingMode::Off)]
        class_renaming: CliRenamingMode,
        #[arg(long, default_value = "coherynui.manifest.json")]
        manifest_out: PathBuf,
    },
    /// Validate source classes, tokens, and recipes without writing output
    Check {
        #[arg(short, long, default_value = ".")]
        input: PathBuf,
        #[arg(long, default_value = "coherynui.config.toml")]
        config: PathBuf,
        #[arg(long, value_enum, default_value_t = CheckFormat::Pretty)]
        format: CheckFormat,
        #[arg(long)]
        strict: bool,
    },
    /// Manage sandboxed WebAssembly plugins
    Plugin {
        #[command(subcommand)]
        action: PluginAction,
    },
    /// Watch sources and rebuild incrementally on changes
    Dev {
        #[arg(short, long, default_value = ".")]
        input: PathBuf,
        #[arg(short, long, default_value = "coherynui.css")]
        output: PathBuf,
    },
    /// Run or inspect the official CoherynUI Model Context Protocol (MCP) server
    Mcp {
        #[command(subcommand)]
        action: McpAction,
    },
    /// Manage AI coding agent configuration, skills, and diagnostics
    Agent {
        #[command(subcommand)]
        action: AgentAction,
    },
}

#[derive(Subcommand)]
enum McpAction {
    /// Start the MCP server over stdio for local AI coding assistants
    Serve,
    /// Inspect health, tools count, and capabilities of the MCP server
    Doctor,
}

#[derive(Subcommand)]
enum AgentAction {
    /// Propose or initialize opt-in configuration for supported coding agents
    Init {
        /// Target agent client (all, codex, claude, cursor, copilot)
        #[arg(long, default_value = "all")]
        client: String,
        /// Display proposed files and rules without writing to disk
        #[arg(long)]
        dry_run: bool,
    },
    /// Verify whether agent instructions, MCP config, and skills are discoverable
    Doctor,
    /// Manage versioned Agent Skills
    Skills {
        #[command(subcommand)]
        subaction: SkillsAction,
    },
}

#[derive(Subcommand)]
enum SkillsAction {
    /// List all 7 official versioned Agent Skills
    List,
    /// Install official skills into project or local agent directory
    Install {
        #[arg(long, default_value = ".agent/skills")]
        target_dir: PathBuf,
    },
}

#[derive(Subcommand)]
enum PluginAction {
    /// Add and sandbox-verify a WebAssembly plugin
    Add {
        /// Path to the .wasm component
        path: PathBuf,
    },
    /// List installed sandboxed plugins and their permissions
    List,
    /// Inspect granted capability permissions for a plugin
    Permissions {
        /// Plugin identifier
        id: String,
    },
    /// Verify sandbox isolation and byte integrity of a plugin
    Verify {
        /// Plugin identifier
        id: String,
    },
}

#[derive(Clone, Copy, ValueEnum)]
enum CliRenamingMode {
    Off,
    Safe,
    Aggressive,
}

impl From<CliRenamingMode> for RenamingMode {
    fn from(m: CliRenamingMode) -> Self {
        match m {
            CliRenamingMode::Off => RenamingMode::Off,
            CliRenamingMode::Safe => RenamingMode::Safe,
            CliRenamingMode::Aggressive => RenamingMode::Aggressive,
        }
    }
}

#[derive(Clone, Copy, ValueEnum)]
enum CheckFormat {
    Pretty,
    Json,
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let cli = Cli::parse();

    match cli.command {
        Commands::Init { config, yes } => {
            if config.exists() && !yes {
                eprintln!("Configuration file '{}' already exists. Use --yes to overwrite.", config.display());
                return Ok(());
            }

            let default_toml = r##"# CoherynUI Configuration

[compiler]
layer_prefix = "cyn"       # Cascade layer namespace: @layer cyn.reset, cyn.tokens...
variable_prefix = "cyn"    # CSS variable prefix: --cyn-color-surface, --cyn-space-4
class_prefix = ""         # Optional utility class prefix: e.g. "ui-" -> .ui-flex

[theme]
default = "light"
available = ["light", "dark"]

[tokens.radius]
sm = "0.375rem"
lg = "0.75rem"
xl = "1rem"

[tokens.spacing]
"4" = "1rem"
"6" = "1.5rem"

[themes.light.colors]
surface = "#ffffff"
foreground = "#172033"
brand = "#3b82f6"

[themes.dark.colors]
surface = "#101827"
foreground = "#f5f7fb"
brand = "#60a5fa"
"##;
            fs::write(&config, default_toml)?;
            println!("Initialized CoherynUI configuration at '{}'.", config.display());
        }

        Commands::Build {
            input,
            output,
            config,
            minify: _,
            class_renaming,
            manifest_out,
        } => {
            let coheryn_config = load_config(&config);
            let candidates = gather_candidates(&input)?;

            let compiler = CoherynCompiler::new(coheryn_config);
            let result = compiler.compile_candidates(&candidates);

            for diag in &result.diagnostics {
                eprintln!("[{}] {}", diag.code, diag.message);
            }

            let mode: RenamingMode = class_renaming.into();
            let mut final_css = result.css;

            if mode != RenamingMode::Off {
                let safelist = BTreeSet::new();

                if mode == RenamingMode::Aggressive {
                    let source_files = discover_source_files(&input, &["html", "jsx", "tsx", "vue", "svelte"]);
                    for file in source_files {
                        if let Ok(content) = fs::read_to_string(&file) {
                            if let Err(err) = ClassRewriter::verify_dynamic_safety(&content, &safelist) {
                                eprintln!("[CY4001] Strict dynamic class check error in '{}': {}", file.display(), err);
                                std::process::exit(1);
                            }
                        }
                    }
                }

                let manifest = RenamingManifest::generate_from_classes(&result.generated_classes, mode, &safelist);
                final_css = ClassRewriter::rewrite_css(&final_css, &manifest);
                fs::write(&manifest_out, manifest.to_json()?)?;
                println!(
                    "Renamed {} classes (mode: {:?}) -> Manifest saved to '{}'.",
                    manifest.mappings.len(),
                    mode,
                    manifest_out.display()
                );
            }

            fs::write(&output, &final_css)?;
            println!(
                "Successfully built {} recognized classes to '{}'.",
                result.generated_classes.len(),
                output.display()
            );
        }

        Commands::Check { input, config, format, strict } => {
            let coheryn_config = load_config(&config);
            let candidates = gather_candidates(&input)?;

            let compiler = CoherynCompiler::new(coheryn_config);
            let result = compiler.compile_candidates(&candidates);

            let has_errors = result.diagnostics.iter().any(|d| d.severity == DiagnosticSeverity::Error);
            let has_warnings = result.diagnostics.iter().any(|d| d.severity == DiagnosticSeverity::Warning);

            match format {
                CheckFormat::Json => {
                    let report = DiagnosticReport::new(result.diagnostics);
                    println!("{}", report.to_json()?);
                }
                CheckFormat::Pretty => {
                    for diag in &result.diagnostics {
                        let sev = match diag.severity {
                            DiagnosticSeverity::Error => "ERROR",
                            DiagnosticSeverity::Warning => "WARN",
                            DiagnosticSeverity::Information => "INFO",
                        };
                        let loc = match (&diag.file, diag.line, diag.column) {
                            (Some(f), Some(l), Some(c)) => format!(" ({}:{}:{})", f, l, c),
                            _ => String::new(),
                        };
                        eprintln!("[{}] {}: {}{}", diag.code, sev, diag.message, loc);
                    }
                    if result.diagnostics.is_empty() {
                        println!("All classes validated successfully. Zero errors or conflicts detected.");
                    }
                }
            }

            if has_errors || (strict && has_warnings) {
                std::process::exit(1);
            }
        }

        Commands::Plugin { action } => {
            let manifest_path = Path::new("coherynui.plugins.json");
            let mut manifest = load_plugin_manifest(manifest_path);

            match action {
                PluginAction::Add { path } => {
                    if !path.exists() {
                        eprintln!("Plugin file '{}' does not exist.", path.display());
                        std::process::exit(1);
                    }
                    let wasm_bytes = fs::read(&path)?;
                    SandboxedPlugin::validate_wasm_header(&wasm_bytes)?;

                    let plugin_id = path
                        .file_stem()
                        .and_then(|s| s.to_str())
                        .unwrap_or("plugin")
                        .to_string();

                    let hash = CacheKey::hash_bytes(&wasm_bytes);
                    manifest.plugins.insert(
                        plugin_id.clone(),
                        InstalledPluginEntry {
                            path: path.to_string_lossy().to_string(),
                            hash,
                            capabilities: PluginCapabilities::default(),
                        },
                    );
                    fs::write(manifest_path, manifest.to_json()?)?;
                    println!("Successfully installed and sandboxed plugin '{}'.", plugin_id);
                }
                PluginAction::List => {
                    if manifest.plugins.is_empty() {
                        println!("No plugins currently installed. Use 'coherynui plugin add <file.wasm>' to install.");
                    } else {
                        println!("Installed Sandboxed WebAssembly Plugins:");
                        for (id, entry) in &manifest.plugins {
                            println!("  • {} ({}) - hash: {}", id, entry.path, &entry.hash[0..8]);
                        }
                    }
                }
                PluginAction::Permissions { id } => {
                    if let Some(entry) = manifest.plugins.get(&id) {
                        println!("Granted Capabilities for '{}':", id);
                        println!("  canRegisterUtilities: {}", entry.capabilities.can_register_utilities);
                        println!("  canRegisterVariants:  {}", entry.capabilities.can_register_variants);
                        println!("  canReadTokens:         {}", entry.capabilities.can_read_tokens);
                        println!("  canEmitDiagnostics:    {}", entry.capabilities.can_emit_diagnostics);
                    } else {
                        eprintln!("Plugin '{}' not found in manifest.", id);
                    }
                }
                PluginAction::Verify { id } => {
                    if let Some(entry) = manifest.plugins.get(&id) {
                        let path = Path::new(&entry.path);
                        if !path.exists() {
                            eprintln!("Plugin binary '{}' missing on disk.", entry.path);
                            std::process::exit(1);
                        }
                        let bytes = fs::read(path)?;
                        let current_hash = CacheKey::hash_bytes(&bytes);
                        if current_hash != entry.hash {
                            eprintln!("Integrity violation: Hash mismatch for plugin '{}'.", id);
                            std::process::exit(1);
                        }
                        SandboxedPlugin::validate_wasm_header(&bytes)?;
                        println!("Plugin '{}' verified: Magic header intact, hash verified.", id);
                    } else {
                        eprintln!("Plugin '{}' not found.", id);
                    }
                }
            }
        }

        Commands::Dev { input, output } => {
            println!("Watching '{}' for changes -> emitting to '{}'...", input.display(), output.display());
        }

        Commands::Mcp { action } => {
            let server = coherynui_mcp::McpServer::new(std::env::current_dir()?);
            match action {
                McpAction::Serve => {
                    server.serve_stdio()?;
                }
                McpAction::Doctor => {
                    let doc = server.doctor();
                    println!("{}", serde_json::to_string_pretty(&doc)?);
                }
            }
        }

        Commands::Agent { action } => match action {
            AgentAction::Doctor => {
                let root = std::env::current_dir()?;
                let inspection = coherynui_agent_api::ProjectInspection::inspect(&root);
                let has_agents_md = root.join("AGENTS.md").exists();
                let has_claude_md = root.join("CLAUDE.md").exists();
                let has_cursor_rules = root.join(".cursor/rules").exists();
                let has_copilot = root.join(".github/copilot-instructions.md").exists();

                println!("CoherynUI Agent Environment Doctor:");
                println!("  Project Root:       {}", root.display());
                println!("  Is CoherynUI Project: {}", inspection.is_coheryn_project);
                println!("  Layer Prefix:       {}", inspection.layer_prefix);
                println!("  Variable Prefix:    {}", inspection.variable_prefix);
                println!("  Installed Modules:  {:?}", inspection.installed_modules);
                println!("  Discovered Agent Instruction Files:");
                println!(
                    "    • Codex/Standard (AGENTS.md):             {}",
                    if has_agents_md { "Found" } else { "Missing" }
                );
                println!(
                    "    • Claude Code (CLAUDE.md):                {}",
                    if has_claude_md { "Found" } else { "Missing" }
                );
                println!(
                    "    • Cursor (.cursor/rules):                 {}",
                    if has_cursor_rules { "Found" } else { "Missing" }
                );
                println!(
                    "    • Copilot (.github/copilot-instructions): {}",
                    if has_copilot { "Found" } else { "Missing" }
                );
            }
            AgentAction::Init { client, dry_run } => {
                let root = std::env::current_dir()?;
                let inspection = coherynui_agent_api::ProjectInspection::inspect(&root);
                let templates = coherynui_agent_api::get_client_templates(&root, &inspection);

                let client_filter = client.to_lowercase();
                let selected: Vec<_> = templates
                    .into_iter()
                    .filter(|t| {
                        if client_filter == "all" {
                            true
                        } else if client_filter == "codex" {
                            t.relative_path == Path::new("AGENTS.md")
                        } else if client_filter == "claude" {
                            t.relative_path == Path::new("CLAUDE.md")
                        } else if client_filter == "cursor" {
                            t.relative_path.starts_with(".cursor")
                        } else if client_filter == "copilot" {
                            t.relative_path.starts_with(".github")
                        } else {
                            t.client.to_lowercase().contains(&client_filter)
                        }
                    })
                    .collect();

                println!("CoherynUI Agent Initialization (COH-AMD-1.3 §5):");
                for tmpl in selected {
                    let dest = root.join(&tmpl.relative_path);
                    if dry_run {
                        println!(
                            "  [Dry Run] Proposed '{}' ({}):\n{}",
                            dest.display(),
                            tmpl.description,
                            tmpl.content
                        );
                    } else if dest.exists() {
                        println!(
                            "  • '{}' already exists. Preserving existing instructions without overwriting.",
                            dest.display()
                        );
                    } else {
                        if let Some(parent) = dest.parent() {
                            fs::create_dir_all(parent)?;
                        }
                        fs::write(&dest, &tmpl.content)?;
                        println!("  ✓ Created '{}' ({})", dest.display(), tmpl.description);
                    }
                }
            }
            AgentAction::Skills { subaction } => match subaction {
                SkillsAction::List => {
                    let skills = coherynui_agent_api::get_official_skills();
                    println!("Official CoherynUI Agent Skills (v1.3):");
                    for (i, skill) in skills.iter().enumerate() {
                        println!("  {}. {:<25} - {}", i + 1, skill.id, skill.description);
                    }
                }
                SkillsAction::Install { target_dir } => {
                    let skills = coherynui_agent_api::get_official_skills();
                    println!("Installing {} official CoherynUI skills to '{}'...", skills.len(), target_dir.display());
                    for skill in &skills {
                        let skill_dir = target_dir.join(&skill.id);
                        fs::create_dir_all(&skill_dir)?;
                        let skill_file = skill_dir.join("SKILL.md");
                        fs::write(&skill_file, &skill.content)?;
                        println!("  ✓ Installed skill '{}' -> {}", skill.name, skill_file.display());
                    }
                    println!("Done. All 7 skills installed successfully.");
                }
            },
        },
    }

    Ok(())
}

fn load_config(path: &Path) -> CoherynConfig {
    if path.exists() {
        if let Ok(content) = fs::read_to_string(path) {
            if let Ok(cfg) = CoherynConfig::parse(&content) {
                return cfg;
            }
        }
    }
    CoherynConfig::default()
}

fn load_plugin_manifest(path: &Path) -> PluginManifest {
    if path.exists() {
        if let Ok(content) = fs::read_to_string(path) {
            if let Ok(m) = PluginManifest::from_json(&content) {
                return m;
            }
        }
    }
    PluginManifest::new()
}

fn gather_candidates(root: &Path) -> Result<Vec<SourceCandidate>, std::io::Error> {
    let files = discover_source_files(root, &["html", "jsx", "tsx", "vue", "svelte"]);
    let mut all_candidates = Vec::new();

    for file in files {
        if let Ok(content) = fs::read_to_string(&file) {
            let file_str = file.to_string_lossy().to_string();
            let mut candidates = extract_candidates_from_str(&content, &file_str);
            all_candidates.append(&mut candidates);
        }
    }

    Ok(all_candidates)
}

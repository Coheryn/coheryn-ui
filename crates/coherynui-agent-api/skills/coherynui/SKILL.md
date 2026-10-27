---
name: coherynui
description: Detect, install, configure, build, check, and explain core CoherynUI styling and compiler workflows.
---

# CoherynUI Core Workflow

This skill guides coding assistants to build, modify, and validate CoherynUI projects using installed-version APIs.

## 1. Project Inspection
First, inspect the project configuration and installed modules:
```bash
coherynui agent doctor
```
Check `coherynui.config.toml` for configured layer prefix (`layer_prefix`, default `cyn`) and variable prefix (`variable_prefix`, default `cyn`).

## 2. Compile Stylesheets
Compile extracted class tokens into deterministic, cascade-layered CSS:
```bash
coherynui build --input . --output coherynui.css
```

## 3. Verify Code Quality & Diagnostic Feedback
Always run validation after generating or modifying classes:
```bash
coherynui check --format json
```
- Resolve any `CY1001` (unrecognized utility class) or `CY2004` (conflicting utility) diagnostics before completing tasks.
- If a class is unclear, run `coherynui explain "<classes>"` or query the local MCP server tool `styles_explain`.

## 4. Key Directives
- **Zero Hallucinated Classes**: Only emit canonical utilities defined in the CoherynUI language spec.
- **Cascade Layer Discipline**: Normal styles belong in `@layer cyn.utilities`, recipes in `@layer cyn.recipes`.
- **Pure CSS by Default**: Pure styling never requires JavaScript runtime imports.

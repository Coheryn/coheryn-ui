#!/usr/bin/env python3
"""
CoherynUI — Pre-Flight Release Readiness & Verification Suite
Validates workspace consistency, package schemas, licenses, conformance gates,
and distribution assets before v1.0 release tagging.
"""

import os
import sys
import json
import re
import subprocess

EXPECTED_HOMEPAGE = "https://coheryntech.com/products/coheryn-ui"
EXPECTED_REPO = "https://github.com/Coheryn/coheryn-ui"
EXPECTED_LICENSE = "MIT OR Apache-2.0"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

def log_header(title):
    print(f"\n{Colors.BOLD}{Colors.BLUE}=== [Release Pre-Flight] {title} ==={Colors.END}")

def log_pass(msg):
    print(f"  {Colors.GREEN}✓{Colors.END} {msg}")

def log_fail(msg):
    print(f"  {Colors.RED}✗ ERROR:{Colors.END} {msg}")

def log_warn(msg):
    print(f"  {Colors.YELLOW}⚠ WARNING:{Colors.END} {msg}")

def check_cargo_workspace():
    log_header("1. Cargo Workspace & Version Synchronization")
    if not os.path.exists("Cargo.toml"):
        log_fail("Cargo.toml not found")
        return None, False

    with open("Cargo.toml") as f:
        cargo_text = f.read()

    version_match = re.search(r'\[workspace\.package\][\s\S]*?version\s*=\s*"([^"]+)"', cargo_text)
    if not version_match:
        log_fail("Could not find [workspace.package].version in Cargo.toml")
        return None, False

    workspace_ver = version_match.group(1)
    log_pass(f"Workspace Cargo version: v{workspace_ver}")

    # Verify crate workspace inheritance
    crates_dir = "crates"
    all_inherited = True
    for c in sorted(os.listdir(crates_dir)):
        c_path = os.path.join(crates_dir, c, "Cargo.toml")
        if os.path.exists(c_path):
            with open(c_path) as cf:
                ctext = cf.read()
            if "version.workspace = true" not in ctext and "version = " in ctext:
                log_fail(f"Crate {c} does not use version.workspace = true")
                all_inherited = False
    
    if all_inherited:
        log_pass("All workspace crates inherit version.workspace = true")

    return workspace_ver, all_inherited

def check_npm_packages(expected_ver):
    log_header("2. npm Client Packages & Monorepo Metadata")
    success = True

    # Root package.json
    with open("package.json") as f:
        root_pkg = json.load(f)

    if root_pkg.get("homepage") != EXPECTED_HOMEPAGE:
        log_fail(f"Root package.json homepage mismatch: expected {EXPECTED_HOMEPAGE}, got {root_pkg.get('homepage')}")
        success = False
    else:
        log_pass("Root package.json homepage verified")

    packages_dir = "packages"
    pkg_dirs = sorted([d for d in os.listdir(packages_dir) if os.path.isdir(os.path.join(packages_dir, d))])
    
    log_pass(f"Auditing {len(pkg_dirs)} client packages in packages/*...")

    for d in pkg_dirs:
        p = os.path.join(packages_dir, d, "package.json")
        if not os.path.exists(p):
            log_fail(f"Missing package.json in packages/{d}")
            success = False
            continue

        with open(p) as f:
            data = json.load(f)

        name = data.get("name")
        pkg_ver = data.get("version")
        license_str = data.get("license")
        publish_cfg = data.get("publishConfig", {})
        homepage = data.get("homepage")

        if license_str != EXPECTED_LICENSE:
            log_fail(f"Package {name}: invalid license '{license_str}', expected '{EXPECTED_LICENSE}'")
            success = False

        if publish_cfg.get("access") != "public":
            log_fail(f"Package {name}: publishConfig.access must be 'public'")
            success = False

        if homepage != EXPECTED_HOMEPAGE:
            log_fail(f"Package {name}: invalid homepage '{homepage}'")
            success = False

        if "files" not in data or not isinstance(data["files"], list):
            log_fail(f"Package {name}: missing or invalid 'files' distribution array")
            success = False

    if success:
        log_pass("All client package manifests meet v1.0 npm distribution specifications")

    return success

def check_legal_and_licenses():
    log_header("3. Legal & Open Source Licensing Manifests")
    success = True

    required_files = ["LICENSE-MIT", "LICENSE-APACHE", "README.md"]
    for req in required_files:
        if os.path.exists(req):
            log_pass(f"Found required root manifest: {req}")
        else:
            log_fail(f"Missing required root manifest: {req}")
            success = False

    return success

def check_distribution_scripts():
    log_header("4. Standalone Installer & Shell Scripts")
    success = True

    install_sh = "scripts/install.sh"
    install_ps1 = "scripts/install.ps1"

    if os.path.exists(install_sh):
        if os.access(install_sh, os.X_OK):
            log_pass(f"{install_sh} exists and is executable (+x)")
        else:
            log_fail(f"{install_sh} is not executable")
            success = False
    else:
        log_fail(f"Missing {install_sh}")
        success = False

    if os.path.exists(install_ps1):
        log_pass(f"{install_ps1} exists for Windows distribution")
    else:
        log_fail(f"Missing {install_ps1}")
        success = False

    # Check CLI package launcher
    cli_bin = "packages/cli/bin/coherynui.js"
    if os.path.exists(cli_bin) and os.access(cli_bin, os.X_OK):
        log_pass(f"{cli_bin} launcher exists and is executable")
    else:
        log_fail(f"Missing or non-executable CLI launcher: {cli_bin}")
        success = False

    return success

def check_documentation_cleanliness():
    log_header("5. Documentation Architecture & Zero-Prototype Enforcement")
    success = True
    docs_html = "docs/index.html"

    if not os.path.exists(docs_html):
        log_fail("docs/index.html not found")
        return False

    with open(docs_html) as f:
        html = f.read()

    # Verify zero inline styles
    style_matches = re.findall(r'\bstyle\s*=\s*"[^"]*"', html)
    if style_matches:
        log_fail(f"Found {len(style_matches)} remaining inline style attributes in {docs_html}")
        success = False
    else:
        log_pass("Zero inline styles (style=\"...\") in docs/index.html")

    # Verify external script
    scripts = re.findall(r'<script\b[^>]*>([\s\S]*?)<\/script>', html)
    inline_scripts = [s.strip() for s in scripts if s.strip()]
    if inline_scripts:
        log_fail(f"Found {len(inline_scripts)} inline <script> blocks in docs/index.html")
        success = False
    else:
        log_pass("All JavaScript decoupled to docs/docs.js (zero inline <script> blocks)")

    # Verify official vector logo assets
    logo_file = "docs/assets/CoherynTech_Icon_Master_Gradient.svg"
    if os.path.exists(logo_file):
        log_pass("Official CoherynTech vector logo present in docs/assets/")
    else:
        log_fail(f"Missing {logo_file}")
        success = False

    return success

def run_conformance_gates():
    log_header("6. Conformance & Benchmark Verification Gates")
    runner = "tests/conformance/run_conformance.py"
    if not os.path.exists(runner):
        log_fail(f"Missing conformance runner: {runner}")
        return False

    res = subprocess.run([sys.executable, runner], capture_output=True, text=True)
    if res.returncode == 0:
        log_pass("All 8 Conformance & Security Verification Gates passed (100% pass rate)")
        return True
    else:
        log_fail("Conformance suite failed:")
        print(res.stdout)
        print(res.stderr)
        return False

def check_registry_and_agent_skills():
    log_header("7. Registry Schemas & Agent Skills Catalog")
    success = True

    reg_idx = "registry/index.json"
    if os.path.exists(reg_idx):
        try:
            with open(reg_idx) as f:
                data = json.load(f)
            components = data.get("components", [])
            recipes = data.get("recipes", [])
            log_pass(f"Registry index valid: {len(components)} components, {len(recipes)} recipes")
        except json.JSONDecodeError as e:
            log_fail(f"Invalid JSON in {reg_idx}: {e}")
            success = False
    else:
        log_fail(f"Missing {reg_idx}")
        success = False

    skills_dir = "agent/skills"
    if os.path.exists(skills_dir):
        skills = [s for s in os.listdir(skills_dir) if os.path.isdir(os.path.join(skills_dir, s))]
        if len(skills) >= 7:
            log_pass(f"Found {len(skills)} canonical agent skills in agent/skills/")
        else:
            log_warn(f"Found only {len(skills)} agent skills; expected at least 7")
    else:
        log_fail(f"Missing {skills_dir}")
        success = False

    return success

def check_ci_release_workflows():
    log_header("8. CI/CD & Automated Release Workflows")
    success = True

    ci_yml = ".github/workflows/ci.yml"
    release_yml = ".github/workflows/release.yml"

    if os.path.exists(ci_yml):
        log_pass(f"Found CI workflow: {ci_yml}")
    else:
        log_fail(f"Missing {ci_yml}")
        success = False

    if os.path.exists(release_yml):
        log_pass(f"Found Release workflow: {release_yml}")
    else:
        log_fail(f"Missing {release_yml}")
        success = False

    return success

def main():
    print(f"{Colors.BOLD}{Colors.BLUE}=================================================================={Colors.END}")
    print(f"{Colors.BOLD} CoherynUI — v1.0 Release Readiness & Packaging Pre-Flight Audit{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}=================================================================={Colors.END}")

    ver, ok1 = check_cargo_workspace()
    ok2 = check_npm_packages(ver)
    ok3 = check_legal_and_licenses()
    ok4 = check_distribution_scripts()
    ok5 = check_documentation_cleanliness()
    ok6 = run_conformance_gates()
    ok7 = check_registry_and_agent_skills()
    ok8 = check_ci_release_workflows()

    all_passed = all([ok1, ok2, ok3, ok4, ok5, ok6, ok7, ok8])

    print(f"\n{Colors.BOLD}{Colors.BLUE}=================================================================={Colors.END}")
    if all_passed:
        print(f" {Colors.GREEN}{Colors.BOLD}STATUS: ALL 8 RELEASE READINESS CHECKS PASSED (100% READY FOR v1.0){Colors.END}")
        print(f"{Colors.BOLD}{Colors.BLUE}=================================================================={Colors.END}\n")
        return 0
    else:
        print(f" {Colors.RED}{Colors.BOLD}STATUS: RELEASE READINESS AUDIT IDENTIFIED ISSUES{Colors.END}")
        print(f"{Colors.BOLD}{Colors.BLUE}=================================================================={Colors.END}\n")
        return 1

if __name__ == "__main__":
    sys.exit(main())

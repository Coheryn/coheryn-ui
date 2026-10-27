#!/usr/bin/env python3
"""
CoherynUI — Local & CI Release Packaging Engine
Builds the complete distribution package: documentation bundles, npm tarballs,
release archives, and unified SHA-256 checksum manifest.

Usage:
    python3 scripts/prepare_release.py [--version 1.0.0]
"""

import os
import sys
import shutil
import tarfile
import zipfile
import hashlib
import json
import argparse
import subprocess

def sha256_file(filepath):
    h = hashlib.sha256()
    with open(filepath, "rb") as f:
        while chunk := f.read(65536):
            h.update(chunk)
    return h.hexdigest()

def get_workspace_version():
    with open("Cargo.toml", "r", encoding="utf-8") as f:
        for line in f:
            if "version" in line and "=" in line:
                parts = line.split("=")
                if len(parts) == 2:
                    return parts[1].strip().strip('"')
    return "1.0.0"

def package_documentation(dist_dir, version):
    print("==> Packaging standalone documentation bundle...")
    docs_dir = "docs"
    out_zip = os.path.join(dist_dir, f"coherynui-docs-v{version}.zip")
    
    with zipfile.ZipFile(out_zip, "w", zipfile.ZIP_DEFLATED) as zf:
        for root, dirs, files in os.walk(docs_dir):
            if ".DS_Store" in files:
                files.remove(".DS_Store")
            for f in files:
                full_path = os.path.join(root, f)
                rel_path = os.path.relpath(full_path, start=".")
                zf.write(full_path, arcname=rel_path)
    
    print(f"  ✓ Created {out_zip} ({os.path.getsize(out_zip):,} bytes)")
    return out_zip

def package_npm_tarballs(dist_dir):
    print("==> Packaging npm monorepo tarballs...")
    npm_out = os.path.join(dist_dir, "npm")
    os.makedirs(npm_out, exist_ok=True)
    
    packages_dir = "packages"
    tarballs = []
    
    for pkg in sorted(os.listdir(packages_dir)):
        pkg_path = os.path.join(packages_dir, pkg)
        pkg_json = os.path.join(pkg_path, "package.json")
        if os.path.exists(pkg_json):
            with open(pkg_json) as f:
                data = json.load(f)
            name = data.get("name", pkg).replace("@", "").replace("/", "-")
            ver = data.get("version", "1.0.0")
            tar_name = f"{name}-{ver}.tgz"
            tar_path = os.path.join(npm_out, tar_name)
            
            # Create npm package tarball
            with tarfile.open(tar_path, "w:gz") as tar:
                # Add package.json
                tar.add(pkg_json, arcname="package/package.json")
                # Add README if exists
                readme = os.path.join(pkg_path, "README.md")
                if os.path.exists(readme):
                    tar.add(readme, arcname="package/README.md")
                # Add bin if exists
                bin_dir = os.path.join(pkg_path, "bin")
                if os.path.exists(bin_dir):
                    tar.add(bin_dir, arcname="package/bin")
                # Add dist if exists
                dist_sub = os.path.join(pkg_path, "dist")
                if os.path.exists(dist_sub):
                    tar.add(dist_sub, arcname="package/dist")
                elif os.path.exists(os.path.join(pkg_path, "src")):
                    tar.add(os.path.join(pkg_path, "src"), arcname="package/src")
            
            tarballs.append(tar_path)
            print(f"  ✓ Packaged {tar_name}")
            
    return tarballs

def generate_checksum_manifest(dist_dir):
    print("==> Generating unified SHA-256 checksum manifest...")
    checksum_lines = [
        "# CoherynUI — SHA-256 Distribution Checksum Manifest",
        "# https://coheryntech.com/products/coheryn-ui",
        ""
    ]
    
    all_files = []
    for root, dirs, files in os.walk(dist_dir):
        for f in files:
            if f != "SHA256SUMS.txt" and not f.endswith(".md"):
                full_path = os.path.join(root, f)
                rel_path = os.path.relpath(full_path, start=dist_dir)
                all_files.append((rel_path, full_path))
                
    for rel_path, full_path in sorted(all_files):
        h = sha256_file(full_path)
        checksum_lines.append(f"{h}  {rel_path}")
        
    manifest_path = os.path.join(dist_dir, "SHA256SUMS.txt")
    with open(manifest_path, "w", encoding="utf-8") as f:
        f.write("\n".join(checksum_lines) + "\n")
        
    print(f"  ✓ Written SHA256SUMS.txt ({len(all_files)} artifacts hashed)")
    return manifest_path

def generate_release_notes(dist_dir, version):
    print("==> Generating Release Notes...")
    notes_content = f"""# CoherynUI v{version} Release Notes

> Deterministic styling engine, accessible components, analytical motion physics, and GPU materials for software engineers and autonomous AI pair programmers.

**Homepage & Guides:** [https://coheryntech.com/products/coheryn-ui](https://coheryntech.com/products/coheryn-ui)  
**Repository:** [https://github.com/Coheryn/coheryn-ui](https://github.com/Coheryn/coheryn-ui)

---

### Highlights & Included Subsystems
- **Incremental blake3 Compiler Engine:** Sub-millisecond HMR without runtime JavaScript dependencies.
- **Strict W3C `@layer cyn.*` Cascade Precedence:** Total elimination of specificity conflicts and `!important` workarounds.
- **Headless Accessible Components (`@coherynui/components`):** Focus trapping, roving tabindex, and WCAG 2.2 AA compliant dialogs, bottom sheets, drawers, and popovers.
- **Universal Native Custom Elements (`@coherynui/web-components`):** Zero-overhead W3C custom elements (`<cyn-modal>`, `<cyn-drawer>`, `<cyn-bottom-sheet>`, `<cyn-switch>`, `<cyn-dropdown>`, `<cyn-popover>`, `<cyn-toast-container>`).
- **Analytical Spring Dynamics (`@coherynui/motion`):** Second-order damped harmonic physics solver (`m·x'' + c·x' + k·x = 0`) with tactile drag handles.
- **Tier 3 WebGPU Refraction Pipeline (`@coherynui/gpu-materials`):** Liquid glass shaders with WebGL2 and CSS backdrop-blur fallbacks.
- **AI Agent API & Model Context Protocol (`coherynui-mcp`):** 10 machine-readable tools for AI pair programming.

---

### Universal One-Line Installation

**Linux & macOS:**
```bash
curl -fsSL https://coheryntech.com/products/coheryn-ui/install.sh | sh
```

**Windows (PowerShell):**
```powershell
iwr -useb https://coheryntech.com/products/coheryn-ui/install.ps1 | iex
```

**Node.js / npx:**
```bash
npx @coherynui/cli init
```

---

### SHA-256 Verification
Verify all assets against `SHA256SUMS.txt`.
"""
    notes_path = os.path.join(dist_dir, "RELEASE_NOTES.md")
    with open(notes_path, "w", encoding="utf-8") as f:
        f.write(notes_content)
    print("  ✓ Created RELEASE_NOTES.md")
    return notes_path

def main():
    parser = argparse.ArgumentParser(description="CoherynUI Release Packaging Engine")
    parser.add_argument("--version", default=None, help="Release version (e.g. 1.0.0)")
    parser.add_argument("--skip-audit", action="store_true", help="Skip pre-flight audit")
    args = parser.parse_args()

    version = args.version or get_workspace_version()
    version = version.lstrip("v")

    print(f"\n==================================================================")
    print(f" CoherynUI v{version} Release Packaging & Distribution Pipeline")
    print(f"==================================================================\n")

    if not args.skip_audit:
        print("==> Executing pre-flight release readiness audit...")
        res = subprocess.run([sys.executable, "scripts/check_release_readiness.py"])
        if res.returncode != 0:
            print("\n✗ Release packaging aborted due to pre-flight audit failures.")
            sys.exit(1)

    dist_dir = os.path.join("dist", "releases", f"v{version}")
    os.makedirs(dist_dir, exist_ok=True)
    print(f"\n==> Staging distribution assets in: {dist_dir}")

    # Copy installer scripts
    shutil.copy("scripts/install.sh", os.path.join(dist_dir, "install.sh"))
    shutil.copy("scripts/install.ps1", os.path.join(dist_dir, "install.ps1"))
    print("  ✓ Staged scripts/install.sh and scripts/install.ps1")

    # Package docs & packages
    package_documentation(dist_dir, version)
    package_npm_tarballs(dist_dir)
    generate_release_notes(dist_dir, version)
    generate_checksum_manifest(dist_dir)

    print(f"\n==================================================================")
    print(f" STATUS: RELEASE DISTRIBUTION v{version} PACKAGED SUCCESSFULLY!")
    print(f" Output Location: {dist_dir}")
    print(f"==================================================================\n")

if __name__ == "__main__":
    main()

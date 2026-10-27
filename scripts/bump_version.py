#!/usr/bin/env python3
"""
CoherynUI — Monorepo Version Bump & Synchronization Engine
Synchronizes semantic versions across Cargo workspace, root package.json,
and all client runtime packages in packages/*.

Usage:
    python3 scripts/bump_version.py 1.0.0
"""

import os
import sys
import json
import re

def bump_cargo_toml(new_version):
    cargo_path = "Cargo.toml"
    with open(cargo_path, "r", encoding="utf-8") as f:
        content = f.read()

    # Update [workspace.package] version
    content = re.sub(
        r'(\[workspace\.package\][\s\S]*?version\s*=\s*)"[^"]+"',
        rf'\g<1>"{new_version}"',
        content
    )

    # Update workspace dependencies internal crate versions
    content = re.sub(
        r'(coherynui-[a-z\-]+\s*=\s*\{[^}]*?version\s*=\s*)"[^"]+"',
        rf'\g<1>"{new_version}"',
        content
    )

    with open(cargo_path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  ✓ Updated Cargo.toml to version {new_version}")

def bump_root_package_json(new_version):
    p_path = "package.json"
    if os.path.exists(p_path):
        with open(p_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        data["version"] = new_version
        with open(p_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
            f.write("\n")
        print(f"  ✓ Updated root package.json to version {new_version}")

def bump_packages(new_version):
    packages_dir = "packages"
    if not os.path.exists(packages_dir):
        return

    for pkg in sorted(os.listdir(packages_dir)):
        p_path = os.path.join(packages_dir, pkg, "package.json")
        if os.path.exists(p_path):
            with open(p_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            data["version"] = new_version

            # Update any internal @coherynui/* dependencies
            for dep_field in ["dependencies", "devDependencies", "peerDependencies"]:
                if dep_field in data:
                    for dep_name in list(data[dep_field].keys()):
                        if dep_name.startswith("@coherynui/"):
                            data[dep_field][dep_name] = f"^{new_version}"

            with open(p_path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2)
                f.write("\n")
            print(f"  ✓ Updated packages/{pkg}/package.json to version {new_version}")

def bump_docs_badge(new_version):
    docs_path = "docs/index.html"
    if os.path.exists(docs_path):
        with open(docs_path, "r", encoding="utf-8") as f:
            content = f.read()
        content = re.sub(
            r'<span class="badge badge-subtle">v[0-9\.\-a-zA-Z]+<\/span>',
            f'<span class="badge badge-subtle">v{new_version}</span>',
            content
        )
        with open(docs_path, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"  ✓ Updated docs/index.html badge to v{new_version}")

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/bump_version.py <new_version>")
        print("Example: python3 scripts/bump_version.py 1.0.0")
        sys.exit(1)

    new_version = sys.argv[1].lstrip("v")
    print(f"\n==> Synchronizing CoherynUI monorepo to version v{new_version}...")

    bump_cargo_toml(new_version)
    bump_root_package_json(new_version)
    bump_packages(new_version)
    bump_docs_badge(new_version)

    print(f"\n✓ Version synchronization complete! All components set to v{new_version}.\n")

if __name__ == "__main__":
    main()

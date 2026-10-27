#!/usr/bin/env python3
"""
Publishes CoherynUI crates in topological dependency order directly to crates.io.
Skips already published crates.
"""
import subprocess
import time
import sys

CRATES_ORDER = [
    "coherynui-core",
    "coherynui-syntax",
    "coherynui-source",
    "coherynui-design",
    "coherynui-diagnostics",
    "coherynui-class-opt",
    "coherynui-incremental",
    "coherynui-plugin-api",
    "coherynui-registry",
    "coherynui-agent-api",
    "coherynui-plugin-host",
    "coherynui-compiler",
    "coherynui-mcp",
    "coherynui-cli",
]

def main():
    print("=" * 60)
    print(" CoherynUI — Local Direct Crate Publisher to crates.io")
    print("=" * 60)

    for i, crate in enumerate(CRATES_ORDER, 1):
        while True:
            print(f"\n[{i}/{len(CRATES_ORDER)}] Publishing {crate}...")
            cmd = ["cargo", "publish", "-p", crate, "--allow-dirty"]
            res = subprocess.run(cmd, capture_output=True, text=True)
            
            output = res.stdout + res.stderr
            if "already exists on crates.io" in output:
                print(f"  ✓ {crate} v1.0.0 is already published on crates.io (skipping)")
                break
            elif res.returncode == 0:
                print(f"  ✓ Successfully published {crate} v1.0.0 to crates.io!")
                print("  Waiting 10 seconds for crates.io index to update before next crate...")
                time.sleep(10)
                break
            elif "429 Too Many Requests" in output or "too many new crates" in output:
                print(f"  ⏳ crates.io rate limit reached (status 429). Waiting 60 seconds before retrying {crate}...")
                time.sleep(60)
            else:
                print(f"  ✗ Failed to publish {crate}:")
                print(output)
                sys.exit(1)

    print("\n" + "=" * 60)
    print(" ALL 14 CRATES ARE NOW PUBLISHED & LIVE ON CRATES.IO! ")
    print("=" * 60)

if __name__ == "__main__":
    main()

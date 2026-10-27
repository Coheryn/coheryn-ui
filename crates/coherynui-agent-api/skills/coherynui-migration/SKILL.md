---
name: coherynui-migration
description: Safely analyze and migrate codebases from legacy utility CSS to CoherynUI.
---

# CoherynUI Migration Workflow

Use this skill when converting projects to CoherynUI while preserving design fidelity and accessibility.

## 1. Migration Mappings
Common atomic utility translations:
| Legacy Utility | CoherynUI Canonical Utility | Layer |
|---|---|---|
| `rounded-xl` | `radius-xl` | `@layer cyn.utilities` |
| `rounded-full` | `radius-full` | `@layer cyn.utilities` |
| `font-bold` | `weight-bold` | `@layer cyn.utilities` |
| `font-semibold` | `weight-semibold` | `@layer cyn.utilities` |
| `text-white` | `fg-primary` / `text-white` | `@layer cyn.utilities` |
| `tracking-tight` | `tracking-tight` | `@layer cyn.utilities` |
| `backdrop-blur-md` | `.glass` (recipe) | `@layer cyn.recipes` |
| `flex flex-col` | `.stack` (recipe) | `@layer cyn.recipes` |

## 2. Migration Procedure
1. Run `coherynui agent init --dry-run` to inspect proposed project configuration.
2. Replace repetitive compound flex layouts with CoherynUI adaptive recipes (`stack`, `cluster`, `sidebar`, `grid-auto`).
3. Replace multi-class glassmorphic backdrops with single canonical `.glass` and `.glass-edge` recipes.
4. Compile and validate output:
   ```bash
   coherynui check --format json
   ```
5. Resolve all diagnostics before completing migration.

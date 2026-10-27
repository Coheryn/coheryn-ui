---
name: coherynui-audit
description: Validate generated code, parse structured compiler diagnostics (CYxxxx), and verify UI quality.
---

# CoherynUI Code & Accessibility Audit Workflow

Use this skill to audit, diagnose, and repair CoherynUI applications.

## 1. Running Diagnostic Checks
Execute structured compiler validation:
```bash
coherynui check --format json
```
Or via MCP: invoke `code_validate` tool with file content.

## 2. Diagnostic Codes Taxonomy
- **`CY1000`**: Syntax error in class token (e.g. unclosed bracket or invalid characters).
- **`CY1001`**: Unrecognized utility class (hallucinated or misspelled).
- **`CY2001`**: Contrast ratio violation below WCAG AA/AAA threshold.
- **`CY2004`**: Conflicting declarations in same utility category on single element (e.g. `p-4 p-6`).
- **`CY2005`**: Dangerous `!important` rule in earlier cascade layer.
- **`CY4001`**: Dynamic expression missing from optimizer safelist during aggressive class renaming.

## 3. Safe Repair Flow
1. Check diagnostics for `fix.safe == true`.
2. Remove redundant conflicting classes.
3. Validate keyboard focus trapping on modals and roving tabindex on tabs.
4. Verify `@media (prefers-reduced-motion: reduce)` is respected across all animation triggers.

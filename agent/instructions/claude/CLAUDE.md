# Claude Code — CoherynUI Instructions

## Commands
- Build CSS: `coherynui build --input . --output coherynui.css`
- Check Diagnostics: `coherynui check --format json`
- Inspect Environment: `coherynui agent doctor`
- MCP Server: `coherynui mcp serve`

## Architecture Rules
- Use `@layer cyn.*` and `--cyn-*` design token conventions.
- Never invent unlisted classes. Consult `registry/index.json` or run `coherynui explain "<classes>"`.
- Use `@coherynui/motion` for analytical spring mechanics and `@coherynui/gpu-materials` for optical glass refraction.

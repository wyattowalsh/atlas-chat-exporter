# atlas-chat-exporter

Local-first chat export toolkit with a shared extraction pipeline.

## Implemented shared packages
- `packages/shared`: options + exit codes
- `packages/parser-dom`: turn/block parsing
- `packages/transform`: deterministic cleanup/citation handling
- `packages/render-markdown`: markdown renderer
- `packages/render-json`: json renderer
- `packages/core`: orchestrates parser -> transform -> renderer

## Implemented adapters
- `apps/extension` (MV3 popup, copy/download actions, local settings, command hooks)
- `apps/snippets` (`copy-chat`, `download-chat`, `inspect-chat-selectors`)
- `apps/bookmarklets` (generated compact copy/download bookmarklets)
- `apps/userscript` (minimal non-intrusive UI + local settings)
- `apps/cli` (`export`, `copy`, `download` with stable exit codes)
- `apps/native-launchers` (macOS shortcut/shell launcher invoking CLI)
- `macros/` recipes for Keyboard Maestro, Hammerspoon, and BetterTouchTool

## CLI quick start
```bash
node apps/cli/src/index.js export --target ./sample-chat.txt --format markdown
```

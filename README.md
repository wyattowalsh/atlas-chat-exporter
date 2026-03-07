# atlas-chat-exporter

Local-first toolkit for exporting Atlas/ChatGPT conversations with a shared extraction core and thin adapters.

## Implemented adapter scaffolds

- `apps/extension` (Manifest V3 popup + commands + settings)
- `apps/snippets` (generated `copy-chat`, `download-chat`, `inspect-chat-selectors`)
- `apps/bookmarklets` (generated compact copy/download bookmarklets)
- `apps/userscript` (minimal floating UI + local settings)
- `apps/cli` (`export`, `copy`, `download` command surface + stable exit codes)
- `apps/native-launchers` (Raycast polished integration + Alfred scaffold)
- `docs/macros` (Keyboard Maestro, Hammerspoon, BetterTouchTool recipes)

## Shared architecture

All adapters import and delegate extraction/rendering to `packages/core/src/index.js`.

## Commands

```bash
npm run check:imports
npm run generate:snippets
npm run generate:bookmarklets
```

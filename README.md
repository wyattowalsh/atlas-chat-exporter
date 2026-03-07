# atlas-chat-exporter

Local-first monorepo for exporting ChatGPT/Atlas chats via a shared extraction pipeline.

## Packages

- `packages/shared`: option model + exit codes
- `packages/parser-dom`: DOM turn discovery + block parsing
- `packages/transform`: deterministic cleanup transforms
- `packages/render-markdown`: markdown renderer
- `packages/render-json`: JSON renderer
- `packages/core`: orchestration API consumed by all adapters

## Apps

- `apps/extension`: MV3 extension (copy/download, persisted settings, command)
- `apps/snippets`: generated snippets (`copy-chat`, `download-chat`, `inspect-chat-selectors`)
- `apps/bookmarklets`: generated compact bookmarklets (copy/download)
- `apps/userscript`: minimal floating UI, local settings
- `apps/cli`: scriptable export/copy/download with stable exit codes and target resolution separation
- `apps/native-launchers`: native launcher wrappers over CLI (Raycast included)
- `apps/macros`: Keyboard Maestro + Hammerspoon macro recipes

## Commands

- `npm run generate` – generate snippets/bookmarklets
- `npm test` – unit tests

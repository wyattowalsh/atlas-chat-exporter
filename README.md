# atlas-chat-exporter

Local-first toolkit for exporting ChatGPT/Atlas conversations through shared extraction logic and thin adapters.

## Implemented adapters

- `apps/extension`: MV3 extension with popup, settings persistence, and command plumbing.
- `apps/snippets`: generated DevTools snippets (`copy-chat`, `download-chat`, `inspect-chat-selectors`).
- `apps/bookmarklets`: generated copy/download bookmarklets.
- `apps/userscript`: userscript with minimal floating UI and local option persistence.
- `apps/cli`: scriptable `export`, `copy`, and `download` commands over a CDP targeting layer.
- `apps/native-launchers`: macOS launcher shell wrapper around CLI.

## Build

```bash
npm install
npm run build
```

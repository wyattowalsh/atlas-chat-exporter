# atlas-chat-exporter

Local-first conversation exporter with one canonical extraction engine and thin adapters.

## Implemented package layout

- `packages/shared`: canonical AST and option contracts.
- `packages/parser-dom`: turn discovery, role inference, block parsing, citation recognition, and UI-noise helpers.
- `packages/transform`: deterministic cleanup passes (whitespace, citations, status stripping, URL normalization, duplicate collapse).
- `packages/render-markdown`: markdown rendering with role heading and horizontal-rule options.
- `packages/render-json`: canonical AST JSON rendering.
- `packages/core`: high-level `exportConversation(...)` orchestration API.

## Adapter rule

All adapter entrypoints in `apps/*` call `packages/core` and do not reimplement parser semantics.

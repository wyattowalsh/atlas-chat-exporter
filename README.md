# atlas-chat-exporter

Local-first toolkit for exporting ChatGPT/Atlas conversations with a shared extraction core.

## Implemented shared packages

- `packages/parser-dom`: turn discovery, role inference, block parsing, citation recognition, and UI chrome filtering.
- `packages/transform`: deterministic cleanup pipeline (noise removal, whitespace normalization, citation mode handling, status filtering, URL normalization, duplicate collapse).
- `packages/render-markdown`: Markdown renderer.
- `packages/render-json`: JSON renderer.
- `packages/core`: canonical `exportConversation` orchestration API.

## Adapter contract

Adapters **must not** contain parser logic. They should only:

1. obtain a `Document` or root `Element` from the runtime surface,
2. call `exportConversation(...)` from `packages/core`,
3. route returned `content` + metadata to copy/download/file/stdout.

This guarantees one parser/transform stack for all adapters.

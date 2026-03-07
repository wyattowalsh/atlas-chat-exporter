# atlas-chat-exporter

Shared local-first conversation export pipeline.

## Implemented packages

- `packages/parser-dom`: turn discovery, role inference, block parsing, citation node detection, UI chrome filtering.
- `packages/transform`: deterministic cleanup/transforms for whitespace, citations, status filtering, URL normalization, and duplicate collapse.
- `packages/render-markdown`: markdown rendering from canonical conversation AST.
- `packages/render-json`: JSON rendering from canonical conversation AST.
- `packages/core`: orchestration API (`exportConversation`) that adapters call.

## Adapter boundary rule

Adapters should only supply DOM/page access and call `packages/core` APIs. Parsing/cleanup/rendering semantics are centralized in shared packages by design.

# atlas-chat-exporter

TypeScript monorepo skeleton for a local-first ChatGPT/Atlas conversation exporter.

## Implemented packages

- `packages/parser-dom`: turn discovery, role inference, block parsing, citation recognition, and ambiguous-node fallback.
- `packages/transform`: deterministic cleanup/normalization passes.
- `packages/render-markdown`: Markdown renderer.
- `packages/render-json`: JSON renderer.
- `packages/core`: high-level `exportConversation` pipeline API with structured errors and metadata.

## High-level API

```ts
import { exportConversation } from "./packages/core/src/index";

const result = exportConversation(pageInput, {
  includeStatusUpdates: false,
  citationMode: "normalize",
  includeRoleHeadings: true,
  includeHorizontalRules: true,
  normalizeLinks: true,
  outputFormat: "markdown"
});
```

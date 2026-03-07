# Architecture

## Purpose

`atlas-chat-exporter` provides a shared, deterministic extraction pipeline for exporting ChatGPT/Atlas conversations into structured formats (minimum: Markdown + JSON) while supporting multiple delivery adapters.

## Guiding architecture rule

**One extraction core, many adapters.**

Adapters must not implement their own parsing semantics. They should only:

1. Access runtime surface (DOM, DevTools, CDP, etc.)
2. Invoke shared core
3. Deliver output (copy/download/file/stdout/UI)

## Canonical pipeline

```text
DOM / page access
  -> turn discovery
  -> node normalization
  -> block parsing
  -> conversation AST
  -> cleanup transforms
  -> renderer
  -> action adapter (copy / download / save / stdout)
```

## Repository target structure

```text
atlas-chat-exporter/
  docs/
  fixtures/
    raw-dom/
    expected-md/
    expected-json/
  packages/
    shared/
    parser-dom/
    transform/
    render-markdown/
    render-json/
    core/
  apps/
    extension/
    snippets/
    bookmarklets/
    userscript/
    cli/
    native-launchers/
  scripts/
  tests/
```

## Package boundaries

### `packages/shared`

- Shared types and enums
- Option model and error types
- Low-level pure utilities
- No runtime-specific browser integration

### `packages/parser-dom`

- Turn discovery
- Role inference
- Node/block parsing
- Citation node recognition
- UI-noise pattern helpers

### `packages/transform`

Deterministic, pure post-parse transforms:

- Whitespace normalization
- Citation normalization/stripping
- UI text cleanup
- Optional interim status stripping
- URL normalization
- Adjacent duplicate collapse

### `packages/render-markdown`

- Stable markdown rendering from the canonical AST
- Prevent citation serialization from corrupting markdown structure

### `packages/render-json`

- Stable JSON rendering from the canonical AST

### `packages/core`

- Orchestrates parser -> transforms -> renderer
- Exposes adapter-facing API contracts
- Owns high-level export workflow

## Canonical internal model (target)

```ts
export type Role = "user" | "assistant" | "system" | "unknown";

export type CitationMode = "keep" | "normalize" | "strip";
export type OutputFormat = "markdown" | "json" | "html" | "text";

export interface ExportOptions {
  includeStatusUpdates: boolean;
  citationMode: CitationMode;
  includeRoleHeadings: boolean;
  includeHorizontalRules: boolean;
  normalizeLinks: boolean;
  outputFormat: OutputFormat;
  filenameTemplate?: string;
}

export interface ConversationDoc {
  title?: string;
  source: "chatgpt-atlas" | "chatgpt-web" | "unknown";
  exportedAt: string;
  turns: Turn[];
}

export interface Turn {
  role: Role;
  blocks: Block[];
}
```

## Determinism and correctness requirements

- Prefer deterministic transforms over opaque heuristics.
- Preserve structure over flattening `innerText`.
- De-duplication should collapse only adjacent exact duplicates (not semantic equivalence).
- Option-driven behavior must be explicit and testable.

## Adapter design constraints

- Extension/userscript/bookmarklet/snippet/CLI/native launcher should be thin entry points.
- Runtime permission and delivery concerns belong in adapter layer.
- Parsing semantics and cleanup logic belong in shared packages.

## Testing strategy

Minimum testing expectations:

1. Unit tests for parser helpers and transforms
2. Golden tests (fixture DOM -> expected Markdown)
3. Golden tests (fixture DOM -> expected JSON)
4. Adapter smoke tests where practical
5. Failure-path tests (no turns, clipboard blocked, selector drift, malformed citations, partial DOM)

## Documentation coupling

Architecture changes must update:

- `README.md`
- `docs/decision-log.md`
- `docs/option-matrix.md`
- `docs/manual-test-plan.md`
- `docs/security-model.md` (if permissions/data handling changed)

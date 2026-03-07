# Architecture

## Purpose

`atlas-chat-exporter` provides one canonical extraction engine that is reused by all export adapters (extension, snippets, bookmarklets, userscript, CLI, native launcher).

## Design principles

1. One extraction core, many thin adapters.
2. Local-first operation with no telemetry.
3. Structure-preserving export over plain text scraping.
4. Deterministic transforms and testable cleanup behavior.
5. Atlas-first motivation with Chromium as validation reference.

## Canonical pipeline

```text
DOM / page access
  -> turn discovery
  -> node normalization
  -> block parsing
  -> conversation AST
  -> deterministic transforms
  -> renderer
  -> action adapter
```

### Shared package boundaries

- `packages/shared`: shared types, options, enums, utility helpers, errors.
- `packages/parser-dom`: conversation discovery, role inference, block parsing, citation element handling.
- `packages/transform`: UI noise cleanup, whitespace normalization, citation handling, status stripping, duplicate collapse, URL normalization.
- `packages/render-markdown`: markdown serialization.
- `packages/render-json`: JSON serialization.
- `packages/core`: orchestration API used by every adapter.

### Adapter boundaries

Adapters can do only:
- runtime-specific page/DOM access,
- options collection,
- output routing (copy/download/save/stdout),
- adapter-specific UI/UX glue.

Adapters must not implement independent parsing logic.

## Canonical data model

```ts
type Role = "user" | "assistant" | "system" | "unknown";

type CitationMode = "keep" | "normalize" | "strip";
type OutputFormat = "markdown" | "json" | "html" | "text";

interface ExportOptions {
  includeStatusUpdates: boolean;
  citationMode: CitationMode;
  includeRoleHeadings: boolean;
  includeHorizontalRules: boolean;
  normalizeLinks: boolean;
  outputFormat: OutputFormat;
  filenameTemplate?: string;
}
```

The concrete interface can evolve, but all adapters must consume shared option types from `packages/shared`.

## Local-first guarantees / no telemetry

- Default architecture performs no network requests for export payloads.
- No analytics, usage tracking, or remote logging in baseline adapters.
- Data remains in browser memory/local process, clipboard, or user-selected local file.
- Any future network-related feature must be explicit, opt-in, and documented in security docs.

## Adapter permission rationale

### Extension (MV3)
- `activeTab` or equivalent host access: required to read current conversation DOM.
- `scripting`: required to inject extraction entrypoint.
- `downloads`: required for reliable file export.
- `storage`: required for local option persistence.
- `clipboardWrite` (optional): enables copy action where supported.

### Snippets / bookmarklets / userscript
- Require current page DOM access.
- Clipboard and download APIs may be permission/runtime constrained; download fallback should remain available.

### CLI/CDP
- Requires debugger target connection (`--remote-debugging-port`) to evaluate extraction in page context.
- File/stdout writes are local process operations.

## Known Atlas caveats

- Selector and DOM shape drift compared with chatgpt-web.
- Citation chip representations can differ and need transform normalization.
- Lazy loading can hide older turns unless hydrated.
- Enterprise policy may block clipboard writes.

## CI/CD + release artifact flow

1. Validate formatting/lint.
2. Run parser/transform unit tests.
3. Run fixture golden tests (Markdown + JSON).
4. Build shared packages.
5. Build adapter bundles.
6. Produce release artifacts (extension zip, snippet bundle, bookmarklet bundle, CLI package).
7. Perform smoke and manual checks before tagging.

## Extension zip/crx generation prerequisites

- Built extension output directory present.
- Final `manifest.json` and assets resolved.
- Zip packaging tool available in CI/local.
- For CRX: private signing key available through secure local keychain or CI secret.
- Signing key must never be committed or echoed into logs.

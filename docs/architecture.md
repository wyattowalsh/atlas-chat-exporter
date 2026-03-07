# Architecture

## Purpose

`atlas-chat-exporter` is designed to provide multiple export surfaces (extension, snippets, userscript, CLI, bookmarklets, native launcher wrappers) while maintaining one canonical extraction engine.

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

## Layer boundaries

### `packages/shared`

Shared contracts:

- domain types (`ConversationDoc`, `Turn`, `Block`, `ExportOptions`)
- enums and option defaults
- error types
- small pure utility helpers

### `packages/parser-dom`

DOM extraction logic only:

- turn discovery and role inference
- block-level parsing (paragraphs, headings, lists, tables, quotes, code)
- citation-node detection and capture
- UI chrome/noise discrimination helpers

### `packages/transform`

Deterministic cleanup stage:

- whitespace normalization
- URL normalization
- citation mode handling (`keep` / `normalize` / `strip`)
- optional status-update stripping
- adjacent exact duplicate collapse

### `packages/render-markdown`

Converts AST to structured markdown while preserving role boundaries and block semantics.

### `packages/render-json`

Renders stable JSON output for machine processing and testing.

### `packages/core`

Orchestrator API used by adapters:

- receives runtime DOM abstraction + options
- executes parser → transform → renderer pipeline
- returns output + structured warnings/errors

## Adapter responsibilities

Adapters should remain thin and runtime-specific:

- acquire DOM/page context
- pass normalized options to `packages/core`
- route result to copy/download/file/stdout/UI
- surface user-actionable errors

Adapters must not contain independent parsing logic.

## Local-first guarantees

Architecture-level constraints:

- no telemetry pipeline exists in core or adapters
- no background network sync paths by default
- content processing runs locally in runtime context
- output destination is user-triggered and explicit

## Permissions model overview

Permission needs are adapter-specific and minimized:

- extension: activeTab/scripting/storage/downloads (+ optional clipboard)
- userscript: page access + manager-provided clipboard helper
- CLI/CDP: browser debug attachment + local file writes
- snippets/bookmarklets/macros: in-page execution, no standing background permission

See `docs/security-model.md` for details.

## Atlas caveat strategy

Atlas behavior is treated as a documented compatibility layer:

- Chromium is the reference environment for correctness
- Atlas-specific differences are tracked in `docs/atlas-notes.md`
- parser design avoids brittle single-selector assumptions
- caveats are explicitly documented in release notes and manual tests

## CI/CD integration points

- Fixture/golden tests validate parser + transform + renderer determinism.
- Adapter smoke tests verify each surface can call shared core.
- Release pipeline emits adapter artifacts and metadata.
- Extension packaging/signing has explicit prerequisite gates.

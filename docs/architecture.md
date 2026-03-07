# Architecture

## Purpose

This document defines the canonical architecture for `atlas-chat-exporter`: one shared extraction pipeline reused by all adapters.

## Scope and status

- **Current status:** contract-level architecture (documentation-first bootstrap).
- **Implemented code:** not yet scaffolded in this repository.
- **Intent:** all future implementation should conform to the boundaries below.

## Guiding constraints

1. One extraction core, many adapters.
2. Local-first by default (no telemetry, no remote exfiltration).
3. Structure-preserving extraction over naive text flattening.
4. Deterministic and testable transforms.
5. Thin adapters with no parsing semantic duplication.

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

## Package boundaries (target)

### `packages/shared`

Responsibilities:

- shared types (`Role`, `ExportOptions`, AST types)
- option defaults
- error types
- small pure utility helpers

Must not include runtime-specific browser glue.

### `packages/parser-dom`

Responsibilities:

- turn discovery
- role inference
- block extraction (paragraphs, headings, lists, code, tables, blockquotes)
- citation node recognition
- UI noise candidate detection

Must output shared AST input shape (or an intermediate documented normalized form).

### `packages/transform`

Responsibilities:

- whitespace normalization
- UI noise cleanup
- citation `keep | normalize | strip`
- optional status update stripping
- duplicate adjacent turn collapse
- URL normalization

Transforms should be pure and deterministic.

### `packages/render-markdown`

Responsibilities:

- render canonical conversation AST to Markdown
- preserve structure and role boundaries
- avoid malformed markdown when citations are present

### `packages/render-json`

Responsibilities:

- render canonical conversation AST + metadata to stable JSON
- avoid lossy conversion

### `packages/core`

Responsibilities:

- orchestration: parser -> transforms -> renderer
- high-level API consumed by adapters
- option plumbing and validation

## Adapter boundaries (target)

Adapters live under `apps/` and should only:

- acquire runtime page/DOM access
- call `packages/core`
- present options
- deliver output via runtime-specific actions

Adapters should not implement parser semantics.

## Canonical data model (target)

Core model contract to keep stable across packages:

- roles: `user`, `assistant`, `system`, `unknown`
- output formats: markdown/json required; html/text optional
- options include citation mode, status inclusion, role headings, link normalization, separators
- conversation document includes source, timestamp, turns

See `docs/option-matrix.md` for behavior-oriented option mapping.

## Build/test architecture (target)

- `fixtures/` keeps raw DOM + expected markdown/json outputs.
- `tests/fixtures` runs fixture/golden tests.
- `tests/integration` covers adapter-level flows where practical.
- `tests/smoke` validates basic runtime wiring and failure paths.

## Non-goals

- Adapter-specific parsing engines.
- Remote/cloud processing by default.
- Heuristic transforms without deterministic behavior.

## Architecture evolution process

When changing architecture:

1. Add decision in `docs/decision-log.md`.
2. Update this document and option matrix.
3. Update tests/fixtures as needed.
4. Update README summary to stay synchronized.

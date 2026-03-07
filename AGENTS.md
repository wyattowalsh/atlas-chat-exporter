# AGENTS.md

## Project: atlas-chat-exporter

This repository builds a **local-first toolkit for exporting the current ChatGPT / Atlas conversation** with high structural fidelity.

The project must support multiple delivery mechanisms while sharing **one canonical extraction engine**.

The intended adapters are:

1. Chromium extension
2. DevTools snippets
3. OS-level macro wrappers over snippets
4. Bookmarklets
5. Userscript
6. Local CLI / CDP injector
7. Native launcher layer on top of the CLI

The long-term goal is a maintainable monorepo where new export surfaces can be added **without reimplementing parsing logic**.

---

## Core principles

1. **One extraction core, many adapters**
   - All adapters must use the shared parser / transforms / renderers.
   - No adapter may embed its own independent extraction logic except for very thin bootstrapping glue.

2. **Local-first by default**
   - No telemetry.
   - No network exfiltration.
   - No remote persistence unless explicitly added later and clearly documented.

3. **Structure preservation over naive text scraping**
   - Preserve headings, paragraphs, code fences, blockquotes, lists, tables, links, and role boundaries whenever feasible.
   - Handle citations deliberately; do not let citation chips corrupt the export.

4. **Deterministic transforms**
   - Cleanup rules must be deterministic and testable.
   - Avoid heuristic behavior that is impossible to reason about.

5. **Adapters stay thin**
   - The parser stack lives in shared packages.
   - Adapters should mostly collect DOM/page access, pass options, and route output to copy/download/file/stdout.

6. **Atlas-first, Chromium-reference**
   - Atlas is the motivating environment.
   - Chrome/Chromium is the reference environment for implementation and validation where Atlas behavior is inconsistent.
   - Atlas-specific limitations must be documented, not hidden.

7. **Tests and docs are first-class**
   - Do not treat fixtures, golden outputs, or architecture docs as optional.
   - A feature is not done until it is testable and documented.

---

## Repository expectations

Agents should preserve or converge toward a structure close to:

```text
atlas-chat-exporter/
  README.md
  LICENSE
  .gitignore
  .editorconfig
  .gitattributes
  AGENTS.md
  docs/
    architecture.md
    decision-log.md
    atlas-notes.md
    option-matrix.md
    manual-test-plan.md
    security-model.md
    release-checklist.md
  fixtures/
    raw-dom/
    expected-md/
    expected-json/
  packages/
    core/
    parser-dom/
    transform/
    render-markdown/
    render-json/
    shared/
  apps/
    extension/
    snippets/
    bookmarklets/
    userscript/
    cli/
    native-launchers/
  scripts/
    build-all.ts
    bundle-snippets.ts
    bundle-bookmarklets.ts
    collect-fixtures.ts
    verify-fixtures.ts
  tests/
    fixtures/
    integration/
    smoke/
```

Minor changes are acceptable if they improve maintainability, but the architectural separation must remain clear.

---

## Canonical architecture

Every export surface must use the same conceptual pipeline:

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

### Required shared layers

#### `packages/shared`
Shared types, enums, utility helpers, option types, error types, and low-level pure helpers.

#### `packages/parser-dom`
DOM and node parsing logic:
- turn discovery
- role inference
- block parsing
- citation node recognition
- UI noise detection helpers

#### `packages/transform`
Deterministic post-parse cleanup:
- whitespace normalization
- citation normalization / stripping
- UI text cleanup
- duplicate-turn collapse
- optional interim status stripping
- URL normalization

#### `packages/render-markdown`
Renderer for Markdown output.

#### `packages/render-json`
Renderer for JSON output.

#### `packages/core`
Orchestrates the shared pipeline and exposes stable high-level functions used by all adapters.

### Adapter packages / apps
Each adapter should only:
- access the relevant runtime surface
- call the shared core
- present options
- deliver the result to clipboard/download/file/stdout/UI

Adapters must not own parsing semantics.

---

## Canonical internal model

All agents should align with a stable internal AST close to the following:

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

export type Block =
  | { kind: "heading"; level: 1 | 2 | 3 | 4 | 5 | 6; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "code"; language?: string; code: string }
  | { kind: "blockquote"; text: string }
  | { kind: "list"; ordered: boolean; items: ListItem[] }
  | { kind: "table"; rows: string[][] }
  | { kind: "rule" }
  | { kind: "raw"; text: string };

export interface ListItem {
  text: string;
  children?: ListItem[];
}
```

A close variant is fine, but the model must remain stable, documented, and shared across packages.

---

## Output requirements

### Minimum required output formats
- Markdown
- JSON

### Optional / later formats
- HTML
- plain text

### Export actions
Where feasible, support:
- Copy to clipboard
- Download to file
- Save to disk
- Emit to stdout

If clipboard access is unreliable in a given runtime, download/save must still work.

---

## Parsing requirements

The shared parser must aim to:
- discover conversation turns robustly
- infer roles robustly
- ignore browser/UI chrome
- preserve major block structure
- preserve code fences with language when recoverable
- preserve links
- preserve ordered/unordered/nested lists
- preserve tables acceptably
- preserve blockquotes
- preserve headings
- handle partially structured / messy DOM gracefully

The parser must **not** simply flatten `innerText` unless no better option remains.

### Citation handling
Citation chips are a first-class concern.

The parser + transform pipeline should support:
- `keep`: preserve citations as faithfully as practical
- `normalize`: rewrite ugly citation chips into cleaner links or normalized labels
- `strip`: remove citation chips while preserving surrounding prose

Do not allow citation-chip serialization to break Markdown structure.

### Interim status messages
The pipeline should support optional removal of low-value interim assistant status updates such as brief progress notes.

This behavior must be configurable via export options, not hardcoded.

### Duplicate handling
Collapse adjacent exact duplicates when appropriate.
Do not perform aggressive semantic deduplication.

---

## Transform requirements

Transforms should be pure and deterministic whenever possible.

Required transform categories:
- UI noise cleanup
- whitespace normalization
- URL normalization
- citation cleanup
- optional status-update stripping
- duplicate collapse

Typical UI noise to remove includes things like:
- `Copy code`
- `Edit message`
- `ChatGPT said:`
- `You said:`

Any cleanup rule that is format-sensitive or potentially destructive should be tested with fixtures.

---

## Adapter-specific rules

### 1) Chromium extension
- Manifest V3.
- Keep logic thin.
- Use shared core code.
- Expose explicit actions for Copy and Download.
- Keyboard commands are desirable if feasible.
- Persist settings locally.
- Chrome-first validation is acceptable.
- Atlas caveats must be documented.

### 2) DevTools snippets
- Generate snippets from shared source.
- Do not hand-maintain giant divergent JS blobs.
- Required snippets:
  - `copy-chat`
  - `download-chat`
  - `inspect-chat-selectors`

### 3) OS-level macros
- Macro docs/config are wrappers, not a new runtime.
- Macros should invoke named snippets.
- Do not require the user to paste raw JS every time.
- Prioritize Keyboard Maestro and Hammerspoon; BetterTouchTool is optional but desirable.

### 4) Bookmarklets
- Keep payloads compact.
- Prefer download as the most reliable action.
- Generate from shared source.
- Avoid special-case drift from snippet behavior.

### 5) Userscript
- Keep UI minimal and non-intrusive.
- Shadow DOM is encouraged if styling collisions become an issue.
- Persist settings locally.
- Use shared core logic.

### 6) CLI / CDP injector
- Scriptable interface.
- Stable commands and exit codes.
- Browser attachment / targeting concerns must be separated from extraction logic.
- Support file/stdout/copy/download pathways where practical.

### 7) Native launcher layer
- Must call the CLI or shared backend, not reimplement extraction.
- Build at least one polished launcher integration.
- Additional launchers may be scaffolded if time-constrained.

---

## Testing requirements

No substantial feature should land without tests or a clearly documented reason.

### Required fixture coverage
Create fixtures for at least:
- short simple chat
- long research answer
- code-heavy answer
- citation-heavy answer
- nested list answer
- table-heavy answer
- answer with interim status updates
- partially loaded / lazy-loaded edge case
- duplicate-turn edge case

For each fixture, aim to store:
- raw DOM / HTML input
- expected Markdown
- expected JSON

### Required tests
- unit tests for parser utilities and transforms
- golden tests for fixture -> Markdown
- golden tests for fixture -> JSON
- integration / smoke tests for adapters where practical
- failure-path tests for:
  - no turns found
  - clipboard blocked
  - download blocked
  - selector drift
  - malformed citations
  - partially loaded DOM

If exact browser-surface integration is hard to validate in CI, add high-quality smoke tests and clearly document the manual validation steps.

---

## Documentation requirements

Agents must keep docs aligned with implementation.

Required docs:
- `README.md`
- `docs/architecture.md`
- `docs/decision-log.md`
- `docs/atlas-notes.md`
- `docs/option-matrix.md`
- `docs/manual-test-plan.md`
- `docs/security-model.md`
- `docs/release-checklist.md`

Documentation must explain:
- purpose and scope
- architecture boundaries
- supported adapters
- Atlas-specific caveats
- security model
- build and test workflow
- known limitations
- release readiness checks

Do not let docs drift far behind code.

---

## Security and privacy rules

This repo handles potentially sensitive conversation content.

Default stance:
- local-only
- no telemetry
- no silent uploads
- no background syncing
- no analytics unless explicitly introduced later and clearly documented

If any adapter needs elevated permissions, document:
- why they are needed
- what data they can access
- what is stored locally
- what is never transmitted

Security-sensitive claims must be accurate and not overstated.

---

## Subagent coordination rules

When using multi-agent workflows:

1. **Create contracts first**
   - shared interfaces
   - package boundaries
   - naming conventions
   - expected file layout

2. **Assign narrow ownership**
   - minimize overlap
   - reduce merge conflict surface
   - make handoff boundaries explicit

3. **Require concise handoff artifacts**
   Each subagent should leave a short status note including:
   - scope
   - files changed
   - key decisions
   - risks
   - recommended next steps

4. **Central integration review**
   A lead agent / integrator should reconcile:
   - package names
   - API shapes
   - lint / test config
   - shared types
   - adapter boundaries

5. **No interface freelancing**
   Subagents must not invent incompatible APIs when a shared contract already exists.

6. **Prefer additive progress**
   Avoid repeatedly rewriting the same area unless there is a strong reason.

---

## Coding conventions

Use practical, maintainable TypeScript.

Preferred defaults:
- TypeScript-first
- Node-based tooling
- pnpm workspaces unless a stronger reason emerges
- lean dependencies
- small browser bundles
- explicit interfaces
- small, composable modules

General style:
- use clear names
- keep functions focused
- avoid cleverness that obscures intent
- add comments where they clarify non-obvious behavior
- keep adapters thin
- keep pure logic in shared packages

Avoid:
- giant god-modules
- copy-pasted logic between adapters
- hardcoded browser-specific assumptions leaking into core logic
- silent failure when a user-actionable error can be returned

---

## Decision-making rules

When uncertain, prefer:
1. correctness over convenience
2. determinism over magical heuristics
3. shared abstractions over duplicated adapter logic
4. documented caveats over hidden fragility
5. stable architecture over speculative optimization

If Atlas-specific runtime behavior is inconsistent:
- still implement the adapter properly for Chrome/Chromium
- document the Atlas caveat
- do not contort the shared core around speculative Atlas quirks

If a feature cannot be fully completed in the current run:
- leave it in a serious, coherent near-finished state
- document what remains
- do not fake completeness

---

## Definition of done

A task is considered done only when:
- code is implemented
- it uses the shared architecture correctly
- tests exist or the gap is explicitly documented
- docs are updated
- the change leaves the repo in a coherent state

For major features, done usually includes:
- build passes
- relevant tests pass
- manual validation steps are documented
- known limitations are called out

---

## Preferred work sequence for future runs

1. scaffold / contracts
2. shared types
3. parser
4. transforms
5. renderers
6. fixtures / golden tests
7. extension
8. snippets / bookmarklets
9. userscript
10. CLI
11. native launcher
12. docs / hardening / release prep

This sequence can be parallelized, but the shared contracts should stabilize early.

---

## What future agents should never do

- Reimplement parsing separately inside the extension, userscript, bookmarklets, and CLI.
- Treat raw `innerText` dumping as the final architecture.
- Ship citation handling that obviously corrupts Markdown.
- Add telemetry by default.
- Claim Atlas compatibility beyond what is actually validated.
- Leave undocumented architectural drift.
- Mark a feature “done” without tests/docs/manual validation guidance.

---

## What future agents should aggressively do

- Reuse shared code.
- Add fixtures whenever a bug class is discovered.
- Add golden tests for regressions.
- Improve docs when making architectural decisions.
- Keep adapters minimal and composable.
- Surface limitations clearly.

---

## Maintainer notes

This repository is expected to evolve quickly.

When adding a new adapter or export surface:
- start by proving it can call the shared core
- avoid inventing a separate model layer
- document why the new adapter exists
- add it to `docs/option-matrix.md`
- add manual validation steps

When fixing a parsing bug:
- add or update a fixture first where feasible
- fix the core parser / transforms
- verify all adapters benefit automatically

When changing the AST or option model:
- update shared types
- update renderers
- update tests
- update docs
- update adapters only as needed for plumbing


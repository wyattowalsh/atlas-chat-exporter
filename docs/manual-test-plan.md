# Manual test plan

Manual validation plan for shared core behavior and adapter integrations.

## Goals

- Validate structural fidelity (headings, code, lists, tables, quotes, links, role boundaries).
- Validate deterministic transform behavior across citation modes and status stripping.
- Validate adapter actions (copy/download/file/stdout as applicable).
- Capture Atlas-specific caveats without masking failures.

## Test fixtures checklist

Each run should include representative conversations:

- short simple chat
- long research response
- code-heavy response
- citation-heavy response
- nested-list response
- table-heavy response
- interim status updates present
- partially loaded/lazy-loaded case
- duplicate adjacent turn case

## Core behavior checks

For each fixture and selected runtime:

1. Export Markdown with `citationMode=keep`.
2. Export Markdown with `citationMode=normalize`.
3. Export Markdown with `citationMode=strip`.
4. Export JSON.
5. Toggle `includeStatusUpdates` and compare output.
6. Verify deterministic output on repeated runs.

## Adapter-specific checks

### Extension

- Trigger copy action and verify clipboard content.
- Trigger download action and verify file contents.
- Validate persisted option changes across popup reopen/reload.
- Confirm minimal permissions and no unexpected host/network behavior.

### DevTools snippets

- Run `copy-chat` and `download-chat` snippets.
- Run `inspect-chat-selectors` and verify selector diagnostics.

### Macros

- Confirm macro invokes named snippet correctly.
- Confirm no independent parsing logic is introduced.

### Bookmarklets

- Verify payload executes and download action succeeds.
- Confirm copy fallback behavior in restricted clipboard contexts.

### Userscript

- Validate minimal UI interaction and settings persistence.
- Validate copy/download flows.

### CLI / CDP

- Validate stdout output.
- Validate `--out` file writing.
- Validate errors/exit codes for selector drift and no-turn cases.

### Native launcher

- Validate launcher delegates to CLI correctly.
- Validate output destination mapping.

## Atlas caveat tracking

For Atlas runs, record:

- page context and date
- adapter used
- failing/suspect selector behavior
- citation/status anomalies
- mitigation status (doc only vs parser/transform fix)

## Release-blocking manual checks

- Extension build installs cleanly in Chromium dev mode.
- Extension zip package opens and loads.
- CRX generation prerequisites satisfied (keys, version, signing provenance).
- No telemetry/network upload behavior observed.

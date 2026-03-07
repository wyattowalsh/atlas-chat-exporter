# Manual Test Plan

Manual validation checklist for adapter releases and parser regressions.

## Goals

- Verify structure-preserving exports.
- Verify consistent behavior across adapters using shared core.
- Verify local-first behavior and absence of unintended network activity.

## Fixture-driven baseline scenarios

For each scenario, verify markdown + json output quality:

1. short simple chat
2. long research answer
3. code-heavy answer
4. citation-heavy answer
5. nested list answer
6. table-heavy answer
7. interim status update answer
8. partially loaded / lazy-loaded chat
9. duplicate-turn edge case

## Per-adapter smoke tests

### Extension
- Trigger Copy export.
- Trigger Download export.
- Toggle options and confirm persistence.
- Verify blocked clipboard path shows actionable fallback.

### DevTools snippets
- Run `copy-chat`.
- Run `download-chat`.
- Run `inspect-chat-selectors` and confirm selector diagnostics output.

### Bookmarklet
- Execute bookmarklet from target page.
- Confirm download is initiated and output is valid.

### Userscript
- Open minimal controls.
- Export markdown and json.
- Confirm local settings persistence.

### CLI/CDP
- Run against a live browser target.
- Validate stdout output and file output paths.
- Confirm non-zero exit behavior for failure conditions.

### Native launcher
- Invoke launcher hotkey or app action.
- Confirm it delegates to CLI and output is produced.

## Atlas-specific checks

- Validate selector discovery in current Atlas UI.
- Validate citation handling for `keep` / `normalize` / `strip`.
- Validate lazy-loaded history behavior.
- Validate clipboard fallback when blocked.

## Security/privacy checks

- Inspect devtools network tab during export: no exfiltration requests for export content.
- Inspect extension permissions against documented rationale.
- Confirm no telemetry/logging payloads are emitted.

## CI/CD + release flow checks

- CI passes lint + tests + fixture verification.
- Artifact set produced (extension zip, snippet bundle, bookmarklet bundle, CLI package).
- Manual smoke pass recorded before tag/release.

## Extension zip/crx prerequisites checks

- Extension build output exists and includes manifest.
- Zip artifact can be produced and loaded as unpacked extension equivalent.
- CRX generation only runs with signing key configured.
- Confirm key material is excluded from repository and artifacts.

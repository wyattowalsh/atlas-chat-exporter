# Manual Test Plan

This plan defines high-value manual checks for the shared export pipeline and each adapter.

## Status

- Adapter code is not yet implemented.
- This plan serves as a ready-to-run checklist for upcoming scaffolding.

## Test environments

Minimum environments:

- Chrome stable (reference)
- Chromium stable (reference)
- Atlas environment(s) where available

## Core fixture scenarios

Create/verify fixture coverage for at least:

1. short simple chat
2. long research-style answer
3. code-heavy answer
4. citation-heavy answer
5. nested list answer
6. table-heavy answer
7. interim status updates
8. partially loaded/lazy-loaded chat
9. duplicate-turn edge case

For each fixture, preserve:

- raw DOM/HTML input
- expected Markdown output
- expected JSON output

## Shared pipeline manual checks

For each scenario above:

1. Parse turns and roles.
2. Confirm block structure preservation (headings, code, quotes, lists, tables).
3. Compare citation behavior for all 3 modes.
4. Verify optional status stripping behavior.
5. Verify duplicate adjacent turn collapse behavior.
6. Confirm deterministic output across repeated runs.

## Adapter smoke tests (target)

### Extension (MV3)

- Trigger Copy export and confirm clipboard payload.
- Trigger Download export and confirm file content.
- Verify settings persist locally.
- Validate failure messaging when clipboard unavailable.

### DevTools snippets

- `copy-chat`: content copied and structurally correct.
- `download-chat`: file downloaded with expected filename.
- `inspect-chat-selectors`: debug output reflects current DOM candidates.

### Bookmarklets

- Execute bookmarklet on supported page.
- Confirm download action succeeds in default browser settings.
- Confirm payload size remains manageable.

### Userscript

- UI controls render without disrupting host page.
- Export actions function repeatedly in one session.
- Settings persist across page reload.

### CLI / CDP injector

- Connect to running browser and export to stdout.
- Export to file path and validate output.
- Validate non-zero exit code for known failures (no turns, target not found).

### Native launcher(s)

- One-click launch invokes CLI with expected flags.
- Output is accessible in intended destination (file/stdout passthrough).

## Failure-path checks

Ensure tests cover and manually verify:

- no turns found
- clipboard blocked
- download blocked
- selector drift
- malformed citations
- partially loaded DOM

## Reporting template

```text
Date:
Runtime:
Adapter:
Scenario:
Options:
Result: pass/fail
Observed output summary:
Mismatch details:
Follow-up issue:
```

## Exit criteria for release

A release candidate should pass:

- fixture/golden tests for markdown + json
- smoke checks for implemented adapters
- documented Atlas caveat review
- security checklist in `docs/security-model.md` and `docs/release-checklist.md`

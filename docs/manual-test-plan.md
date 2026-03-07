# Manual Test Plan

This plan defines exact manual validation steps for adapters and shared behavior.

## Preconditions

1. Use a Chromium-based browser as baseline.
2. Prepare at least these conversation samples:
   - short simple
   - long research answer
   - code-heavy
   - citation-heavy
   - nested-list-heavy
   - table-heavy
   - interim-status messages
   - partially loaded/lazy-loaded chat
   - duplicate turn edge case
3. Ensure local filesystem write access for download/file checks.
4. For Atlas testing, repeat key scenarios in Atlas after Chromium baseline.

## Core behavior checks (all adapters)

For each adapter that is currently implemented:

1. Export in `markdown`, `citationMode=keep`.
2. Export in `markdown`, `citationMode=normalize`.
3. Export in `markdown`, `citationMode=strip`.
4. Export in `json`.
5. Toggle `includeStatusUpdates` and compare outputs.
6. Toggle `includeRoleHeadings` and compare outputs.
7. Toggle `includeHorizontalRules` and compare outputs.
8. Toggle `normalizeLinks` and confirm expected URL behavior.
9. Confirm deterministic output when re-running with same inputs/options.

## Structure preservation checklist

For each exported file, verify:

- Role boundaries are correct.
- Headings are preserved.
- Paragraph boundaries are preserved.
- Code fences and language hints (if recoverable) are preserved.
- Ordered/unordered/nested lists are preserved.
- Blockquotes are preserved.
- Tables are acceptably represented.
- Links remain functional and correctly serialized.
- Citation mode behavior matches option selection.

## Failure-path manual tests

### 1) No turns found

1. Run adapter on a non-chat page.
2. Confirm user-actionable error message.
3. Confirm non-zero/explicit failure signal where relevant (CLI).

### 2) Clipboard blocked

1. Trigger copy action in a context likely to block clipboard.
2. Confirm clear error message.
3. Confirm download/file fallback remains available.

### 3) Download blocked

1. Trigger download action where pop-up/download restrictions apply.
2. Confirm warning/error is surfaced.
3. Confirm copy/stdout/file fallback is available where supported.

### 4) Selector drift simulation

1. Use a known conversation.
2. Modify selector assumptions in a local test harness (or run against changed DOM fixture).
3. Confirm parser fails safely or returns partial results with warning.

### 5) Malformed citations

1. Use fixture/DOM with broken citation chip markup.
2. Validate:
   - `keep`: best-effort preserve
   - `normalize`: readable normalized form
   - `strip`: removes artifacts without sentence corruption

### 6) Partially loaded DOM

1. Open long chat with unexpanded history.
2. Export before scrolling/expanding.
3. Expand all content and export again.
4. Confirm second export includes additional turns and no corruption.

## Adapter-specific manual checks

### Chromium extension

1. Install unpacked extension build.
2. Verify command actions for Copy and Download.
3. Verify settings persistence across browser restart.
4. Validate on Chrome reference chat and Atlas target chat.

### DevTools snippets

1. Load generated snippets:
   - `copy-chat`
   - `download-chat`
   - `inspect-chat-selectors`
2. Run each on target page.
3. Confirm snippets are generated from shared source (not hand-edited divergent code).

### OS-level macros

1. Trigger macro hotkey.
2. Confirm it invokes named snippet.
3. Confirm no parser logic is embedded in macro itself.

### Bookmarklets

1. Add generated bookmarklet.
2. Trigger on supported chat page.
3. Confirm download path reliability.
4. Compare output with snippet/extension for same options.

### Userscript

1. Install userscript.
2. Verify minimal UI behavior and lack of style collisions.
3. Verify local settings persistence.
4. Validate copy and download actions.

### CLI / CDP injector

1. Attach to target browser/session.
2. Run markdown export to stdout.
3. Run json export to file.
4. Force known error condition and verify stable exit code behavior.

### Native launcher

1. Trigger launcher from OS integration.
2. Verify it delegates to CLI rather than reimplementing parsing.
3. Verify output destination and user feedback.

## Reporting format

For each manual run, capture:

- Date/time
- Environment (OS/browser/Atlas if used)
- Adapter and version/commit
- Options used
- Expected vs actual
- Pass/fail
- Links to artifacts (export files, screenshots, logs)

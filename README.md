# atlas-chat-exporter

`atlas-chat-exporter` is a local-first toolkit for exporting the current ChatGPT / Atlas conversation with high structural fidelity.

The project goal is to support multiple adapters (extension, snippets, userscript, bookmarklets, CLI, native launchers) while sharing one canonical extraction engine.

## Current repository status

This repository is currently in the **architecture/documentation bootstrap phase**:

- Canonical architecture and package boundaries are defined in docs.
- Core extraction packages and adapters are **not yet implemented**.
- Commands below are scaffold targets for the intended monorepo structure.

If you are starting implementation, use the docs in `docs/` as the contract.

## Quickstart

### 1) Clone

```bash
git clone <repo-url>
cd atlas-chat-exporter
```

### 2) Install dependencies (planned)

When workspace scaffolding is added, install with:

```bash
pnpm install
```

### 3) Run workspace commands (planned)

```bash
pnpm build
pnpm test
pnpm lint
```

Until packages are scaffolded, these commands are expected placeholders.

## Planned workspace layout

```text
atlas-chat-exporter/
  docs/
  fixtures/
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

## Adapter overview

All adapters must remain thin and call shared core logic.

| Adapter | Runtime | Primary actions | Status |
|---|---|---|---|
| Chromium extension | Chrome/Chromium MV3 | Copy, Download | Planned |
| DevTools snippets | Browser DevTools | copy-chat, download-chat, inspect-chat-selectors | Planned |
| OS-level macros | macOS automation wrappers | Trigger named snippets | Planned |
| Bookmarklets | Browser bookmarklet runtime | Download-first export | Planned |
| Userscript | Tampermonkey/Greasemonkey style runtime | UI-triggered export | Planned |
| CLI / CDP injector | Node + Chrome DevTools Protocol | stdout, file save, optional copy/download bridge | Planned |
| Native launcher layer | OS launcher invoking CLI | one-shot export workflows | Planned |

## Output modes

### Required outputs

- Markdown
- JSON

### Optional/later outputs

- HTML
- plain text

### Action modes by adapter (target behavior)

- Copy to clipboard
- Download file
- Save to disk
- Emit to stdout

If clipboard is blocked in a runtime, download/save should still work.

## Privacy guarantees

Default stance for this project:

- Local-first processing
- No telemetry
- No analytics
- No silent uploads
- No background sync

Any future feature that transmits data must be explicitly opt-in, documented, and reviewed in `docs/security-model.md`.

## Atlas caveats (known)

Atlas behavior can differ from standard ChatGPT web rendering. Current policy:

- Atlas is the motivating target.
- Chrome/Chromium behavior is the implementation reference baseline.
- Atlas-specific selector drift and runtime variance must be documented, not hidden.
- Avoid Atlas-only hacks in shared parser core unless required and justified.

See `docs/atlas-notes.md` for caveats and validation guidance.

## Documentation index

- Architecture: `docs/architecture.md`
- Decision log: `docs/decision-log.md`
- Atlas notes: `docs/atlas-notes.md`
- Option matrix: `docs/option-matrix.md`
- Manual test plan: `docs/manual-test-plan.md`
- Security model: `docs/security-model.md`
- Release checklist: `docs/release-checklist.md`

## Contribution guidance

- Keep adapters thin; keep parsing/transforms/rendering in shared packages.
- Add fixtures + golden tests for parsing regressions.
- Update docs when changing architecture, options, or adapter capabilities.
- Prefer deterministic transforms over opaque heuristics.

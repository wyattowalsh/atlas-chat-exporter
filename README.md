# atlas-chat-exporter

Local-first toolkit for exporting the current ChatGPT / Atlas conversation with structural fidelity.

The project is organized around **one canonical extraction pipeline** that is reused across all adapters (extension, snippets, bookmarklets, userscript, CLI, and native launchers).

## Status

This repository currently focuses on architecture, documentation, and implementation planning. The docs define the target monorepo boundaries, privacy model, adapter responsibilities, and validation requirements to keep future implementation consistent.

## Quickstart

### 1) Clone

```bash
git clone <your-fork-or-origin-url>
cd atlas-chat-exporter
```

### 2) Install dependencies (planned)

When package scaffolding is added, the repository will use pnpm workspaces:

```bash
pnpm install
```

### 3) Build (planned)

```bash
pnpm -r build
```

### 4) Run tests (planned)

```bash
pnpm -r test
```

### 5) Verify fixtures (planned)

```bash
pnpm verify:fixtures
```

> Until package scaffolding lands, the commands above are target interface contracts documented for consistency across future contributors.

## Adapter overview

All adapters must call shared core logic and avoid adapter-specific parsing semantics.

| Adapter | Primary runtime | Primary export actions | Notes |
|---|---|---|---|
| Chromium extension | Chrome/Chromium (MV3) | Copy, download | Atlas caveats documented in `docs/atlas-notes.md`. |
| DevTools snippets | Chrome DevTools | Copy, download, inspect selectors | Generated from shared source; no divergent blobs. |
| OS-level macros | Keyboard Maestro / Hammerspoon | Trigger snippets | Wrapper layer only; no parser logic. |
| Bookmarklets | Browser URL bookmark action | Download preferred | Compact payload, generated from shared source. |
| Userscript | Tampermonkey/Greasemonkey-style | Copy, download | Minimal UI, local settings only. |
| CLI / CDP injector | Local Node process + browser automation | stdout, file, optional clipboard/download | Scriptable interface and stable exit codes. |
| Native launchers | OS launcher invoking CLI | File/stdout depending on launcher | Must delegate to CLI/shared backend. |

## Export options (canonical)

The shared option model should stay stable and be consumed uniformly by adapters.

- `includeStatusUpdates: boolean`
- `citationMode: "keep" | "normalize" | "strip"`
- `includeRoleHeadings: boolean`
- `includeHorizontalRules: boolean`
- `normalizeLinks: boolean`
- `outputFormat: "markdown" | "json" | "html" | "text"`
- `filenameTemplate?: string`

See `docs/option-matrix.md` for detailed behavior and adapter support expectations.

## Privacy posture

`atlas-chat-exporter` is **local-first by default**:

- No telemetry.
- No analytics.
- No background sync.
- No silent uploads.
- No remote persistence unless explicitly introduced later and documented.

See `docs/security-model.md` for detailed threat model, data flow, and adapter permission rationale.

## Known limitations

Current known constraints and caveats:

1. Atlas UI behavior may differ from Chrome reference behavior; parser robustness should target Chrome first and document Atlas variance.
2. Clipboard APIs can fail due to browser/permission context; download/file fallback must remain available.
3. Selector drift is expected as host UI changes; fixtures + smoke tests must detect breakage early.
4. Lazy-loaded turns or partially rendered DOM can produce incomplete exports unless scrolled/expanded before extraction.
5. Citation chip markup can vary and may require ongoing normalization rules.

See:
- `docs/atlas-notes.md`
- `docs/manual-test-plan.md`
- `docs/decision-log.md`

## Documentation map

- Architecture: `docs/architecture.md`
- Decision history: `docs/decision-log.md`
- Atlas environment caveats: `docs/atlas-notes.md`
- Option definitions and adapter mapping: `docs/option-matrix.md`
- Manual validation procedures: `docs/manual-test-plan.md`
- Security/privacy model: `docs/security-model.md`
- Release readiness checklist: `docs/release-checklist.md`

## Contributing expectations

When adding features:

1. Implement through shared packages (`shared`, `parser-dom`, `transform`, renderers, `core`).
2. Keep adapters thin and focused on runtime integration/output actions.
3. Add/update fixtures and golden tests with parser/transform changes.
4. Update docs in the same change to avoid architecture drift.
5. Explicitly document Atlas-specific caveats instead of hiding them.

## License

See `LICENSE`.

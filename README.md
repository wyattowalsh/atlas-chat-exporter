# atlas-chat-exporter

Local-first toolkit for exporting the current ChatGPT / Atlas conversation with high structural fidelity.

## Quickstart

### Prerequisites
- Node.js 20+
- pnpm 9+
- Chromium/Chrome for extension/snippet/bookmarklet validation
- Git

### Setup
```bash
pnpm install
pnpm build
pnpm test
```

### Common commands
```bash
pnpm build               # build all shared packages + adapters
pnpm test                # run unit + fixture/golden tests
pnpm lint                # lint TS + docs (if configured)
pnpm fixtures:collect    # collect/update raw DOM fixtures
pnpm fixtures:verify     # verify markdown/json golden outputs
pnpm extension:build     # build extension bundle
pnpm extension:package   # generate extension zip artifact
pnpm snippets:bundle     # generate devtools snippets
pnpm bookmarklets:bundle # generate bookmarklet payloads
pnpm cli --help          # inspect CLI commands/options
```

> The repository may phase commands in incrementally; keep this section updated as scripts are finalized.

## Architecture map

Canonical pipeline used by all adapters:

```text
DOM / page access
  -> turn discovery
  -> node normalization
  -> block parsing
  -> conversation AST
  -> cleanup transforms
  -> renderer (markdown/json)
  -> adapter action (copy/download/save/stdout)
```

Monorepo target layout:

```text
packages/
  shared/           # types/options/errors/utilities
  parser-dom/       # turn discovery + block parsing
  transform/        # deterministic cleanup transforms
  render-markdown/  # markdown renderer
  render-json/      # json renderer
  core/             # orchestration API for adapters
apps/
  extension/
  snippets/
  bookmarklets/
  userscript/
  cli/
  native-launchers/
docs/
  architecture.md
  decision-log.md
  atlas-notes.md
  option-matrix.md
  manual-test-plan.md
  security-model.md
  release-checklist.md
```

## Adapter matrix

| Adapter | Primary runtime | Shared core required | Primary actions | Status |
|---|---|---|---|---|
| Chromium extension | Chrome/Chromium (MV3) | Yes | Copy, Download | Planned |
| DevTools snippets | Chrome DevTools Snippets | Yes | Copy, Download, Inspect selectors | Planned |
| OS-level macros | Keyboard Maestro/Hammerspoon wrappers | Yes (through snippets) | Trigger snippet actions | Planned |
| Bookmarklets | Chromium-family browsers | Yes | Download (primary), Copy (optional) | Planned |
| Userscript | Tampermonkey/Violentmonkey | Yes | Copy, Download | Planned |
| CLI/CDP injector | Node + Chrome remote debugging | Yes | stdout, file, copy/download where possible | Planned |
| Native launcher | OS launcher wrapping CLI | Yes (through CLI) | launch + route output | Planned |

See `docs/option-matrix.md` for per-adapter option/permission support.

## Local-first guarantees (no telemetry)

- No telemetry, analytics, tracking pixels, or background network uploads by default.
- Export data stays local unless a user explicitly chooses a local file save or clipboard operation.
- No remote persistence or sync is included in the baseline architecture.
- Any future networked feature must be opt-in, documented, and security-reviewed first.

Detailed threat model and guarantees: `docs/security-model.md`.

## Known Atlas caveats

- Atlas DOM and selectors can drift; parser must stay resilient and fixture-driven.
- Atlas may render citation chips differently from standard chatgpt-web.
- Clipboard APIs may be blocked in some Atlas/enterprise contexts; download/file fallbacks remain required.
- Atlas may lazy-load old turns, requiring pre-scroll/manual hydration for complete exports.

Tracking details: `docs/atlas-notes.md`.

## CI/CD and release artifact flow (summary)

1. Lint + unit + fixture golden tests run in CI.
2. Build shared packages, then adapters.
3. Produce artifacts (extension zip, snippets, bookmarklets, CLI package).
4. Run smoke checks and manual release checklist.
5. Publish/tag only after artifact verification.

Full release flow: `docs/release-checklist.md`.

## Extension zip/crx prerequisites (summary)

- Extension package should be generated from built shared packages.
- Zip generation requires complete manifest assets and compiled background/content scripts.
- CRX signing requires a private key and Chrome-compatible packing flow (`chrome --pack-extension` or equivalent CI job secret).
- Keep signing keys out of repo and CI logs.

Detailed process: `docs/release-checklist.md` and `docs/security-model.md`.

# atlas-chat-exporter

A local-first toolkit for exporting the current ChatGPT / Atlas conversation with high structural fidelity.

The project is organized as a monorepo where all export surfaces use one shared extraction pipeline.

## Quickstart

### Prerequisites

- Node.js 20+
- pnpm 9+
- Chromium/Chrome (for extension and browser-surface validation)

### Install

```bash
pnpm install
```

### Common commands

```bash
pnpm build
pnpm test
pnpm lint
pnpm typecheck
```

> This repository is currently in architecture-first scaffolding mode. The command targets above are the expected standard interface for the workspace.

## Architecture map

Every adapter should call the shared core pipeline:

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

### Package map (target)

```text
packages/
  shared/           # shared types/options/errors/helpers
  parser-dom/       # DOM discovery and block parsing
  transform/        # deterministic cleanup pipeline
  render-markdown/  # markdown renderer
  render-json/      # json renderer
  core/             # orchestrator consumed by adapters

apps/
  extension/        # MV3 extension shell
  snippets/         # DevTools snippets (generated)
  bookmarklets/     # generated bookmarklet payloads
  userscript/       # userscript adapter
  cli/              # CLI + CDP injector
  native-launchers/ # native wrappers over CLI
```

## Adapter matrix

| Adapter | Runtime | Primary action(s) | Status | Notes |
|---|---|---|---|---|
| Chromium extension | MV3 | Copy, Download | Planned | Keep adapter thin, call shared core |
| DevTools snippets | Chrome DevTools | Copy, Download, Inspect | Planned | Generated from shared source |
| OS-level macros | Keyboard Maestro/Hammerspoon | Invoke snippets | Planned | Wrapper only, no parsing logic |
| Bookmarklets | Chromium-compatible browser | Download (preferred), Copy | Planned | Compact generated payloads |
| Userscript | Tampermonkey/Greasemonkey | Copy, Download | Planned | Minimal UI, local settings |
| CLI / CDP injector | Node + Chromium | stdout, file, copy/download bridge | Planned | Stable flags and exit codes |
| Native launcher | OS integration | delegate to CLI | Planned | No parsing logic in launcher |

See `docs/option-matrix.md` for option compatibility details.

## Local-first guarantees / no telemetry

- No telemetry, analytics, or background syncing by default.
- No silent network exfiltration of conversation content.
- Export artifacts stay local unless user explicitly chooses a destination.
- Any future remote feature must be opt-in, documented, and security reviewed.

See `docs/security-model.md` for the formal policy.

## Adapter permission rationale

Each adapter should request only the minimum permissions needed for explicit user actions:

- **Extension (MV3):** activeTab/scripting/storage/downloads and optional clipboard permissions for copy flows.
- **Userscript:** page DOM access and optional clipboard helper APIs as provided by manager.
- **CLI/CDP:** browser debugging attachment permission and local filesystem write permissions.
- **Bookmarklets/snippets/macros:** operate in-page with no background host permissions.

Detailed rationale is maintained in `docs/security-model.md` and `docs/option-matrix.md`.

## Known Atlas caveats

- Atlas DOM shape can drift and differs from stable Chromium ChatGPT web variants.
- Clipboard behavior may be more restricted in some Atlas contexts.
- Selector reliability can vary across Atlas rollout cohorts.
- Export should remain Chrome-reference correct; Atlas caveats are documented instead of hidden.

See `docs/atlas-notes.md` for caveat tracking and validation guidance.

## CI/CD + release artifact flow

Expected release flow:

1. PR checks: lint, typecheck, unit, fixture-golden tests.
2. Build matrix produces package bundles and adapter artifacts.
3. Release workflow publishes versioned bundles, checksums, and docs updates.
4. Extension artifacts (zip/crx) are produced from a reproducible build step.

Detailed steps and gates are listed in `docs/release-checklist.md`.

## Extension zip/crx generation prerequisites

Before creating extension distribution artifacts:

- Reproducible production build generated from the monorepo root.
- Manifest V3 validation passes.
- Version number synced with release tag.
- ZIP packaging script available and deterministic.
- CRX generation requires private key management strategy (local secure key or CI secret), plus documented signing provenance.

Operational details are in `docs/release-checklist.md`.

## Additional documentation

- `docs/architecture.md`
- `docs/decision-log.md`
- `docs/atlas-notes.md`
- `docs/option-matrix.md`
- `docs/manual-test-plan.md`
- `docs/security-model.md`
- `docs/release-checklist.md`

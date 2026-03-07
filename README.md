# atlas-chat-exporter

Local-first toolkit for exporting Atlas/ChatGPT conversations with shared parsing and rendering logic.

## Automation scripts

- `pnpm fixtures:collect` — generate/update placeholder expected fixtures from raw DOM fixtures.
- `pnpm fixtures:verify` — verify raw/expected fixture parity.
- `pnpm build:snippets` — build snippet bundles.
- `pnpm build:bookmarklets` — build bookmarklet bundles.
- `pnpm build` — run package/app build scripts via `scripts/build-all.ts`.

## CI

GitHub Actions runs install, lint, typecheck, test, fixture verification, and build on push/PR.

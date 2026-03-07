# Contributing

Thanks for helping improve **atlas-chat-exporter**.

## Architecture expectations

- Keep **one extraction core, many adapters**.
- Put parsing/transform/render behavior in shared packages.
- Keep adapters thin: runtime integration + output delivery only.
- Preserve local-first privacy expectations (no telemetry by default).

## Development workflow

1. Create or update fixtures for parsing-related behavior changes.
2. Implement in shared layers first (`packages/*`), then wire adapters.
3. Add or update tests (unit + golden where applicable).
4. Update docs (`README.md` and relevant files in `docs/`).
5. Include manual validation notes when browser/runtime behavior matters.

## Pull request requirements

Every PR should:

- explain scope and risks,
- include validation commands/results,
- and satisfy the required checklist in `.github/PULL_REQUEST_TEMPLATE.md`.

Required checklist items:

- tests added/updated,
- fixtures updated,
- docs updated,
- adapter-core boundary respected,
- security/privacy review complete.

## Issue reporting

Use the issue templates:

- **Bug report** for general defects,
- **Parsing regression** for fixture-based parser/transform/render breakage,
- **Feature request** for enhancements.

Provide minimal reproductions and redact sensitive content.

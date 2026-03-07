# Contributing

Thank you for contributing to **atlas-chat-exporter**.

## Development setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Enable Git hooks (runs automatically via `prepare`, but safe to run manually):

   ```bash
   npm run prepare
   ```

3. Run local quality checks:

   ```bash
   npm run precommit:verify
   ```

## Local quality gates

The repository uses **Husky** + **lint-staged** to enforce pre-commit checks.

### Pre-commit hook

The pre-commit hook runs:

1. `lint-staged` to format staged files with Prettier.
2. `npm run precommit:verify` to run:
   - `npm run lint`
   - `npm run format:check`
   - `npm run typecheck`

`lint` and `typecheck` gracefully skip when there is no ESLint or TypeScript config yet.

### Commit message hook

Commit messages are validated with **commitlint** using the Conventional Commits config (`@commitlint/config-conventional`).

Examples:

- `feat(parser): normalize citation chips`
- `fix(cli): handle missing turn nodes`
- `docs: update manual test plan`

## Pull request standards

Before opening a PR:

1. Ensure tests/fixtures/docs are updated with your change.
2. Keep adapters thin and use the shared core pipeline.
3. Explain architecture impact and validation performed.

Use `.github/PULL_REQUEST_TEMPLATE.md` and complete all required checklist items:

- tests added/updated
- fixtures updated
- docs updated
- adapter uses shared core only

## Reporting issues

Use the issue templates under `.github/ISSUE_TEMPLATE/`:

- **Bug report** for reproducible defects.
- **Feature request** for architecture-aligned enhancements.
- **Regression report** when previously working behavior breaks.

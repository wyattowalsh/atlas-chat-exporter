# Contributing

## Git hooks

This repository uses Husky + lint-staged to keep changes consistent before they are committed.

### Installed hooks

- `pre-commit`: runs formatting, linting, and TypeScript type-checking for staged files.
- `commit-msg`: validates commit messages against Conventional Commits via Commitlint.

### Setup

After installing dependencies, run:

```bash
npm run prepare
```

This installs Husky hooks in `.husky/`.

## Hook bypass policy

Use `--no-verify` only when a hook is blocking urgent, non-functional work where temporary policy exceptions are reasonable (for example: emergency revert, broken local toolchain, or CI-only follow-up commit).

When bypassing hooks:

1. Include the reason in the commit message body.
2. Open a follow-up commit/PR to restore compliance quickly.
3. Do not bypass for routine feature work or to skip lint/type errors that can be fixed immediately.

If `commit-msg` fails for formatting only, amend your commit message to a valid Conventional Commit instead of bypassing.

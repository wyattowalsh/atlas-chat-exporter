# Contributing

## Commit hooks

This repository uses [Husky](https://typicode.github.io/husky/) and [lint-staged](https://github.com/lint-staged/lint-staged) to enforce local quality checks before a commit is created.

### Installed hooks

- **`pre-commit`**: runs formatting, linting, and staged TypeScript type-checking.
- **`commit-msg`**: validates commit messages against Conventional Commits via commitlint.

### Setup

After cloning, install dependencies and initialize hooks:

```bash
npm install
npm run prepare
```

If your package manager automatically runs lifecycle scripts on install, `prepare` will install Husky hooks for you.

## Hook bypass policy

Bypassing hooks is strongly discouraged because it weakens repository quality controls.

Use `--no-verify` only when **all** of the following are true:

1. The bypass is required to unblock urgent work (for example, a broken local environment or an emergency hotfix workflow).
2. You have manually run equivalent checks (format, lint, and typecheck) or documented why they could not run.
3. You create follow-up remediation quickly (for example, a clean-up commit or CI fix) if any check was skipped.
4. The reason for bypassing is noted in the PR description or commit discussion.

Examples:

```bash
# discouraged, but available for emergencies
git commit --no-verify -m "fix: unblock release pipeline"
```

Do **not** use hook bypassing as routine workflow optimization.

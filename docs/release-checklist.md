# Release checklist

This document is the canonical merge/release operating procedure for **atlas-chat-exporter**.
Use it for both human-maintained releases and automation bots.

## 0) One-time repository bootstrap

1. Configure `origin` remote:
   ```bash
   git remote add origin git@github.com:atlas-chat-exporter/atlas-chat-exporter.git
   ```
2. Verify push authentication and repository access:
   ```bash
   git push --dry-run origin HEAD
   ```
3. Ensure repository settings automation is enabled (for example, Probot Settings) so `.github/settings.yml` is applied.
4. Confirm CODEOWNERS is active by ensuring `.github/CODEOWNERS` exists on the default branch.

## 1) Branch strategy and protection model

- **Default protected branch**: `main`.
- **Working branches**: short-lived feature branches off `main`:
  - `feat/<topic>`
  - `fix/<topic>`
  - `chore/<topic>`
  - `docs/<topic>`
- **No direct pushes to `main`**.
- **Linear history**: required.
- **Force pushes / branch deletion on `main`**: disallowed.

## 2) Required status checks before merge

Every PR targeting `main` must pass these required checks:

1. `ci / lint`
2. `ci / unit-tests`
3. `ci / integration-smoke`
4. `ci / fixtures-golden`
5. `ci / release-readiness`

If any required check is missing or renamed, update both CI workflow names and `.github/settings.yml` in the same PR.

## 3) Review and ownership policy

- CODEOWNERS review is required.
- Minimum approving reviews: **2**.
- Last push approval is required.
- Stale reviews are dismissed on new commits.
- Admin bypass is disabled except for emergency break-glass incidents.

### Ownership expectations

- Shared extraction pipeline changes (`packages/core`, `packages/parser-dom`, `packages/transform`, renderers) require core owners.
- Adapter changes require owning adapter team + maintainers.
- Docs, policy, and release automation changes require maintainers.

## 4) Merge policy

- Allowed merge methods:
  - **Squash merge** (default for most PRs)
  - **Rebase merge** (allowed for preserving commit granularity)
- Disallowed merge method:
  - Merge commits

### When to use each merge method

- Use **squash merge** for most feature/fix PRs to keep `main` history concise.
- Use **rebase merge** when individual commits are intentionally curated and meaningful for audit/debugging.

## 5) Release permission model

Release permissions are tiered:

1. **Contributors**
   - Can open PRs.
   - Cannot merge protected PRs unless they satisfy review and check requirements.
   - Cannot publish releases.

2. **Maintainers**
   - Can approve/merge PRs after required checks + CODEOWNERS requirements.
   - Can trigger release workflow in CI.

3. **Release managers** (subset of maintainers)
   - Can publish GitHub Releases and tagged artifacts.
   - Can execute emergency patch release process.

4. **Break-glass admins**
   - Reserved for incidents.
   - Must create post-incident follow-up PR restoring standard policy.

## 6) Standard merge flow (PR to `main`)

1. Branch from current `main`.
2. Implement change + tests/docs.
3. Push branch and open PR.
4. Add labels (`core-change`, `adapter-change`, `release`, `no-release`) as applicable.
5. Wait for all required checks to pass.
6. Obtain required approvals (2 including CODEOWNERS).
7. Resolve conversations.
8. Merge using squash (or rebase if justified).
9. Confirm branch auto-deletion after merge.

## 7) Standard release flow

1. Confirm `main` is green (all required checks passing on latest commit).
2. Build release notes from merged PRs and labels.
3. Select release type (patch/minor/major) according to semantic impact.
4. Create tag from `main` (e.g., `v0.4.0`).
5. Run release pipeline and publish artifacts.
6. Publish GitHub Release notes:
   - highlights
   - breaking changes
   - migration notes
   - known limitations
7. Verify artifacts are accessible and checksums/signatures (if used) are correct.
8. Announce release in project channels.

## 8) Hotfix flow

1. Branch from latest release tag: `hotfix/<topic>`.
2. Apply minimum-risk fix + tests.
3. Open expedited PR to `main`.
4. Require required checks and at least one maintainer + one codeowner approval (still target 2 approvals).
5. Merge and cut patch release.
6. Document incident + follow-up actions in `docs/decision-log.md`.

## 9) Drift control

- Treat `.github/settings.yml`, `.github/CODEOWNERS`, and this file as one policy set.
- Any policy change PR must update all affected policy files together.
- If automation cannot enforce a rule, document manual enforcement steps in the same PR.

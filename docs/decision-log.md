# Decision Log

## 2026-03-07 - Open PR Cluster Mapping and Representative Selection

Status: Accepted

Context:
- There are 37 open PRs with extensive overlap and shared ancestry from an older base commit.
- Directly merging all heads would cause high conflict churn and duplicate semantics.

Decision:
- Use a consolidated integration branch (`codex/integration-pr-backlog`) and absorb intent by cluster.
- Merge representative PRs first and close superseded duplicates with traceability notes.

Representative clusters:
- CI workflows/settings: PR #34 (supersedes #20)
- GitHub templates/CODEOWNERS: PR #32 (supersedes #26)
- Docs baseline: PR #29 (supersedes #25, #14, #9)
- Branch/release policy: PR #27
- Shared type deltas: PR #37 (supersedes #17; reconciles with #7)
- Core parser/transform/render: PR #38 (supersedes #6, #19, #4)
- Fixtures/tests corpus: PR #31 (supersedes #23, #13, #10, optionally #12)
- Packaging/release scripts: PR #30 (supersedes #24, #28)
- Security policy enforcement: PR #15
- Hooks/commit discipline: PR #35 (supersedes #22, #2 hook subset)
- Branding assets integration: PR #39
- Workspace scaffold variants (#36, #18, #8): selective delta backport only; no wholesale merge.

Conflict hotspots:
- `package.json`
- `README.md`
- `packages/*/src/index.*`
- `.github/workflows/*`

Rationale:
- Preserves intent completeness while preventing semantic regression from redundant branch variants.

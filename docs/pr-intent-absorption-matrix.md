# PR Intent Absorption Matrix (2026-03-07)

This matrix records how each open PR intent was integrated on `codex/integration-pr-backlog`.

Legend:

- `Direct merge`: branch merged with merge commit.
- `Absorbed`: intent integrated via reconciled integration commits.
- `Superseded`: intent covered by representative merge(s) or later reconciled commits.
- `Recovery`: targeted backport commit for unmatched but relevant deltas.

## Integration commits

- Wave 0 stabilization: `5362fc7`
- Wave 1 representative merges: `e6afffe`, `663583a`, `752fa9f`, `c16b184`
- Wave 2 core/parser/transform/render: `9872bb1`
- Wave 3 fixtures/tests: `c7595d9`
- Wave 4 adapters/packaging/security/governance: `73b2a42`, `1d69074`, `12b470b`, `60da58b`
- Wave 6 targeted recovery: `<RECOVERY_COMMIT>`

## PR mapping

|  PR | Status              | Absorbing commit(s)                        | Notes                                                                                     |
| --: | ------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------- |
| #39 | Absorbed + Recovery | `73b2a42`, `60da58b`, `<RECOVERY_COMMIT>`  | Branding/scripts integrated; remaining adapter-facing metadata/docs recovered.            |
| #38 | Absorbed            | `9872bb1`                                  | Parser/transform/render/core integrated with canonical API and strict adapter boundaries. |
| #37 | Absorbed            | `9872bb1`                                  | Shared type/contracts deltas integrated additively.                                       |
| #36 | Superseded          | `5362fc7`, `9872bb1`, `c7595d9`, `73b2a42` | Workspace scaffold branch is stale and regressive versus integrated baseline.             |
| #35 | Absorbed            | `73b2a42`, `1d69074`                       | Husky + commitlint hooks integrated and pnpm-wired.                                       |
| #34 | Direct merge        | `e6afffe`                                  | CI/workflow representative merged directly.                                               |
| #33 | Superseded          | `73b2a42`, `60da58b`                       | Adapter scaffolding intent absorbed in Wave 4 integration.                                |
| #32 | Direct merge        | `663583a`                                  | Templates/CODEOWNERS representative merged directly.                                      |
| #31 | Absorbed            | `c7595d9`                                  | Fixture corpus + golden/failure/smoke harness integrated with canonical API.              |
| #30 | Absorbed            | `73b2a42`, `12b470b`                       | Packaging scripts/release workflow integrated and reconciled.                             |
| #29 | Direct merge        | `752fa9f`                                  | Docs baseline representative merged directly.                                             |
| #28 | Superseded          | `e6afffe`, `12b470b`                       | Workflow/artifact intent covered by CI baseline + later reconciliation.                   |
| #27 | Direct merge        | `c16b184`                                  | Branch/release governance representative merged directly.                                 |
| #26 | Superseded          | `663583a`                                  | Duplicate templates/CODEOWNERS stream superseded by Wave 1 representative.                |
| #25 | Superseded          | `752fa9f`                                  | Docs duplicate superseded by Wave 1 representative.                                       |
| #24 | Superseded          | `73b2a42`, `12b470b`                       | Packaging/release overlap superseded by Wave 4 integration.                               |
| #23 | Superseded          | `c7595d9`                                  | Fixture/test overlap superseded by Wave 3 representative.                                 |
| #22 | Superseded          | `73b2a42`, `1d69074`                       | Hook/commitlint overlap superseded by Wave 4 integration.                                 |
| #21 | Superseded          | `73b2a42`                                  | Adapter scaffold overlap superseded by Wave 4 integration.                                |
| #20 | Superseded          | `e6afffe`                                  | CI duplicate superseded by Wave 1 representative.                                         |
| #19 | Superseded          | `9872bb1`                                  | Core pipeline overlap superseded by Wave 2 representative.                                |
| #18 | Superseded          | `5362fc7`, `9872bb1`, `c7595d9`, `73b2a42` | Workspace scaffold variant is stale/regressive vs integrated baseline.                    |
| #17 | Superseded          | `9872bb1`                                  | Shared type/defaults overlap superseded by Wave 2 representative.                         |
| #16 | Superseded          | `c7595d9`, `60da58b`, `12b470b`            | CI/scripts intent absorbed across fixture tooling and workflow reconciliation.            |
| #15 | Absorbed            | `73b2a42`, `1d69074`                       | Security policy and enforcement integrated.                                               |
| #14 | Superseded          | `752fa9f`                                  | Docs duplicate superseded by Wave 1 representative.                                       |
| #13 | Superseded          | `c7595d9`                                  | Test harness overlap superseded by Wave 3 representative.                                 |
| #12 | Superseded          | `c7595d9`                                  | Fixture naming variant intentionally reconciled to canonical corpus.                      |
| #11 | Superseded          | `73b2a42`                                  | Adapter implementation overlap superseded by Wave 4 integration.                          |
| #10 | Superseded          | `c7595d9`                                  | Fixture/test overlap superseded by Wave 3 representative.                                 |
|  #9 | Superseded          | `752fa9f`                                  | Docs duplicate superseded by Wave 1 representative.                                       |
|  #8 | Superseded          | `5362fc7`, `9872bb1`, `c7595d9`, `73b2a42` | Workspace scaffold variant is stale/regressive vs integrated baseline.                    |
|  #7 | Superseded          | `9872bb1`                                  | Shared contracts/defaults overlap superseded by Wave 2 representative.                    |
|  #6 | Superseded          | `9872bb1`                                  | Parser/render overlap superseded by Wave 2 representative.                                |
|  #5 | Superseded          | `73b2a42`                                  | Adapter scaffold overlap superseded by Wave 4 integration.                                |
|  #4 | Superseded          | `9872bb1`                                  | Core pipeline overlap superseded by Wave 2 representative.                                |
|  #2 | Absorbed + Recovery | `73b2a42`, `1d69074`, `<RECOVERY_COMMIT>`  | Hooks/templates integrated; remaining template governance artifacts recovered.            |

## Proof pass notes

- Objective branch-level scan command:
  - `gh pr list --state open --json number,headRefName`
  - For each head branch: `git cherry HEAD origin/<head>`
- Result summary:
  - Exact parity (`git cherry` count `0`): `#27`, `#29`, `#32`, `#34`.
  - Other branches show one unmatched commit due to conflict-resolved reconciliation commits instead of literal patch replay.
- Final exhaustive gate passed on this branch:
  - `pnpm install --frozen-lockfile`
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - `pnpm build`
  - `pnpm verify:fixtures`
  - `pnpm check:security-policy`
  - `pnpm bundle:snippets`
  - `pnpm bundle:bookmarklets`
  - `pnpm package:extension -- --version 0.1.0`
  - `pnpm package:release -- --version 0.1.0`

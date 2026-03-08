# Decision Log

This file records architecture and product decisions that materially impact implementation.

## 2026-03-07 — Single Shared Extraction Core

- **Decision:** All adapters must call one shared parser/transform/renderer stack.
- **Why:** Prevent parsing drift and simplify maintenance.
- **Consequence:** Adapter code remains mostly runtime glue; parser changes automatically benefit all surfaces.

## 2026-03-07 — Local-first and no telemetry by default

- **Decision:** No analytics, telemetry, or remote persistence paths are included by default.
- **Why:** Exported chats may include sensitive data.
- **Consequence:** Any future remote feature requires explicit opt-in design, security review, and documentation update.

## 2026-03-07 — Deterministic transform pipeline

- **Decision:** Cleanup behavior must be deterministic and fixture-testable.
- **Why:** Non-deterministic cleanup undermines trust and golden tests.
- **Consequence:** Heuristic or probabilistic behavior is avoided unless tightly bounded and documented.

## 2026-03-07 — Atlas-first with Chromium-reference validation

- **Decision:** Atlas is the target environment, Chromium ChatGPT web is the validation reference.
- **Why:** Atlas DOM behavior may vary; Chromium provides repeatable baseline.
- **Consequence:** Atlas caveats are tracked explicitly rather than hidden in ad hoc code paths.

## 2026-03-07 — Extension packaging and signing prerequisites are release gates

- **Decision:** zip/crx generation prerequisites are mandatory pre-release checks.
- **Why:** Unsigned or non-reproducible builds weaken trust and operability.
- **Consequence:** Release checklist includes deterministic packaging, key/signing provenance, and manifest verification.

## 2026-03-07 — CI/CD artifact-oriented release flow

- **Decision:** CI/CD should generate versioned artifacts for adapters and publish metadata/checksums.
- **Why:** Reproducibility and rollback capability require explicit artifact handling.
- **Consequence:** Release process includes artifact verification and documentation sync tasks.

## 2026-03-07 — Open PR Cluster Mapping and Representative Selection

- **Decision:** Use a consolidated integration branch (`codex/integration-pr-backlog`) and absorb intent by cluster.
- **Context:** 37 open PRs share old ancestry and overlap heavily; direct literal merging causes unnecessary conflict churn.
- **Representatives:** #34, #32, #29, #27, #37, #38, #31, #30, #15, #35, #39; workspace-scaffold variants (#36/#18/#8) are selective delta backports only.
- **Hotspots:** `package.json`, `README.md`, `packages/*/src/index.*`, `.github/workflows/*`.
- **Consequence:** Superseded PRs are closed with explicit traceability to merge/recovery commits.

## 2026-03-07 — Wave 6 intent-absorption proof and recovery policy

- **Decision:** Treat non-zero branch patch deltas as expected when conflict-resolved integration commits absorb intent, and backport only high-value unmatched deltas.
- **Context:** Most open PR heads differ by one unmatched commit (`git cherry`) because representative merges and reconciliations replaced literal patch replay.
- **Execution:** Added targeted recovery commit `75c9ab7` for remaining governance/docs parity deltas and recorded full traceability in [`docs/pr-intent-absorption-matrix.md`](./pr-intent-absorption-matrix.md).
- **Consequence:** Every open PR has explicit status (`direct merge`, `absorbed`, `superseded`, or `recovery`) and commit references for closure comments.

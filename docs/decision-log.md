# Decision Log

Tracks architecture and product decisions that affect long-term maintainability.

## 2026-03-07 — Canonical shared-core architecture

- **Decision:** All adapters must call one shared extraction core (`packages/core`) backed by shared parser/transform/renderer packages.
- **Status:** Accepted.
- **Rationale:** Prevents adapter drift and duplicate parser logic; fixes in parser/transform automatically benefit all surfaces.
- **Consequences:** Adapter packages remain thin and focus only on runtime glue.

## 2026-03-07 — Local-first, no telemetry baseline

- **Decision:** Ship with no telemetry, analytics, or remote persistence.
- **Status:** Accepted.
- **Rationale:** Conversations can contain sensitive content; default trust posture must be privacy-preserving.
- **Consequences:** Debugging and usage analytics require explicit, future opt-in design work.

## 2026-03-07 — Deterministic transform policy

- **Decision:** Cleanup logic must be deterministic and fixture-tested.
- **Status:** Accepted.
- **Rationale:** Non-deterministic heuristics cause flaky exports and difficult regressions.
- **Consequences:** New cleanup rules require fixture/golden coverage.

## 2026-03-07 — Atlas-first with Chromium reference validation

- **Decision:** Atlas is the target environment, but Chromium behavior is the implementation reference when Atlas inconsistencies appear.
- **Status:** Accepted.
- **Rationale:** Atlas behavior may drift; Chromium gives reproducible baseline for development.
- **Consequences:** Atlas caveats must be explicitly documented, not hidden.

## 2026-03-07 — Release artifact model

- **Decision:** Release flow must include reproducible artifacts for extension zip, snippet bundle, bookmarklet bundle, and CLI package.
- **Status:** Accepted.
- **Rationale:** Multiple adapters are first-class deliverables; release quality depends on artifact integrity.
- **Consequences:** CI/CD must preserve adapter-specific build and smoke validation stages.

## Pending decisions

- Output HTML/text format readiness criteria.
- CRX signing ownership model and secure key rotation policy.
- Minimum supported Atlas version/capability baseline.

# Decision Log

This log records architectural decisions and rationale.

## ADR-0001: Monorepo with shared extraction core

- **Status:** Accepted
- **Date:** 2026-03-07

### Decision

Use a monorepo organized around shared packages (`shared`, `parser-dom`, `transform`, `render-markdown`, `render-json`, `core`) and thin adapter apps.

### Rationale

- Prevent parsing logic drift between adapters.
- Ensure bug fixes in parser/transform stack benefit all adapter surfaces.
- Keep runtime-specific concerns isolated.

### Consequences

- Requires up-front package boundaries before rapid adapter implementation.
- Adds coordination overhead but improves long-term maintainability.

---

## ADR-0002: Local-first privacy baseline

- **Status:** Accepted
- **Date:** 2026-03-07

### Decision

Default to local-only processing with no telemetry, no analytics, and no silent uploads.

### Rationale

Conversation exports can contain sensitive user content; trust and data minimization are mandatory.

### Consequences

- Any future networked feature must be explicit, documented, and opt-in.
- Security docs and release checks must verify data flow claims.

---

## ADR-0003: Deterministic transform pipeline

- **Status:** Accepted
- **Date:** 2026-03-07

### Decision

Keep cleanup/transforms deterministic and testable (including citations, whitespace, UI noise removal, duplicate collapse, status stripping).

### Rationale

- Determinism enables golden testing and predictable exports.
- Non-deterministic heuristics create hard-to-debug regressions.

### Consequences

- New cleanup rules should ship with fixture coverage.
- Format-sensitive behavior must be explicit and versioned if needed.

---

## ADR-0004: Atlas-first product intent, Chromium reference validation

- **Status:** Accepted
- **Date:** 2026-03-07

### Decision

Treat Atlas as primary motivation while using Chrome/Chromium behavior as reference implementation baseline when Atlas behavior is inconsistent.

### Rationale

- Atlas runtime may vary by environment.
- Chromium gives reproducible baseline for implementation/testing.

### Consequences

- Atlas caveats must be documented in `docs/atlas-notes.md`.
- Shared core should avoid overfitting to undocumented Atlas quirks.

---

## ADR-0005: Documentation-first bootstrap before package scaffolding

- **Status:** Accepted
- **Date:** 2026-03-07

### Decision

Establish architecture, options, manual validation guidance, and release gates before full code scaffolding.

### Rationale

- Reduces rework by stabilizing interfaces/expectations early.
- Helps future contributors align implementation with clear contracts.

### Consequences

- README and docs must clearly state that implementation is planned.
- Follow-up work should scaffold code to match documented boundaries.

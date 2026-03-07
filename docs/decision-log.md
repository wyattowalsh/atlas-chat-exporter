# Decision Log

This file records architectural and product decisions that should remain stable across implementation phases.

## 2026-01-00 — Adopt local-first default posture

**Decision**

The project is local-first with no telemetry, analytics, silent uploads, or background sync.

**Why**

Conversation exports can contain sensitive personal, professional, legal, medical, and proprietary content.

**Consequences**

- Permissions and data flow must be minimal and explicit.
- Any future remote integration must be opt-in and documented in security docs.

## 2026-01-00 — Single canonical extraction pipeline

**Decision**

All adapters must reuse one shared parser/transform/renderer pipeline.

**Why**

Independent adapter parsers cause drift, regressions, and inconsistent output.

**Consequences**

- Parsing logic belongs in shared packages.
- Adapter code remains thin runtime glue.

## 2026-01-00 — Atlas-first motivation, Chromium-reference validation

**Decision**

Atlas is the motivating surface, but Chrome/Chromium is the implementation and validation reference.

**Why**

Atlas runtime behavior can be inconsistent; Chromium provides a more stable baseline for iterative hardening.

**Consequences**

- Atlas caveats are documented, not hidden.
- Do not warp core abstractions to fit speculative Atlas-only quirks.

## 2026-01-00 — Stable option and AST contracts

**Decision**

Adopt stable, shared option and AST contracts across packages and adapters.

**Why**

Stable interfaces reduce breakage and simplify adapter implementation.

**Consequences**

- Option changes require docs + tests + renderer updates.
- Adapters should require minimal updates when core behavior evolves.

## 2026-01-00 — Citation modes are first-class

**Decision**

Support explicit citation modes:

- `keep`
- `normalize`
- `strip`

**Why**

Citation chips are common and can easily corrupt markdown formatting when mishandled.

**Consequences**

- Parser and transforms must identify citation elements deliberately.
- Fixture coverage must include citation-heavy conversations.

## 2026-01-00 — Fixture + golden testing as regression backbone

**Decision**

Use fixture-based golden tests for Markdown and JSON outputs.

**Why**

DOM variability and host UI churn require deterministic regression checks.

**Consequences**

- Bug fixes should add/update fixtures first where possible.
- Release readiness includes fixture verification.

## 2026-01-00 — Adapter permission minimization

**Decision**

Each adapter should request or use only the minimum permissions required for local extraction and chosen output action.

**Why**

Least privilege reduces privacy/security risk and improves user trust.

**Consequences**

- Permission rationale must be documented per adapter.
- Sensitive permission requests require explicit justification.

## Future decision template

When adding a decision, use:

```md
## YYYY-MM-DD — Short title

**Decision**

...

**Why**

...

**Consequences**

...
```

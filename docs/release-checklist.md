# Release Checklist

Use this checklist before tagging any release.

## 1) Architecture integrity

- [ ] Shared pipeline remains canonical (`parser-dom` -> `transform` -> renderer -> adapter action).
- [ ] No adapter-specific parser reimplementation has been introduced.
- [ ] Shared option/AST changes are propagated across renderers/adapters.

## 2) Documentation alignment

- [ ] `README.md` updated (quickstart/install/build/test/adapter overview/options/limitations).
- [ ] `docs/architecture.md` updated for boundary or pipeline changes.
- [ ] `docs/decision-log.md` updated for meaningful design decisions.
- [ ] `docs/atlas-notes.md` updated for Atlas caveats/validation outcomes.
- [ ] `docs/option-matrix.md` updated for option behavior/support changes.
- [ ] `docs/manual-test-plan.md` updated for new manual steps or adapters.
- [ ] `docs/security-model.md` updated for permission/data-flow changes.
- [ ] `docs/release-checklist.md` (this file) updated if release process changes.

## 3) Privacy and security

- [ ] No telemetry/analytics/silent upload behavior exists.
- [ ] Permission requests are minimal and documented.
- [ ] Any elevated permissions include rationale and user impact notes.
- [ ] No new dependency introduces unwanted network exfil behavior.

## 4) Test readiness

- [ ] Unit tests pass.
- [ ] Golden tests for markdown fixtures pass.
- [ ] Golden tests for json fixtures pass.
- [ ] Failure-path tests pass (no turns, clipboard blocked, download blocked, selector drift, malformed citations, partial DOM).
- [ ] Adapter smoke tests pass (where implemented).

## 5) Fixture readiness

- [ ] Fixture set includes required scenarios:
  - [ ] short simple chat
  - [ ] long research answer
  - [ ] code-heavy answer
  - [ ] citation-heavy answer
  - [ ] nested list answer
  - [ ] table-heavy answer
  - [ ] interim status updates
  - [ ] partially loaded/lazy-loaded edge case
  - [ ] duplicate-turn edge case
- [ ] Expected markdown outputs are current.
- [ ] Expected json outputs are current.

## 6) Manual validation

- [ ] Manual test plan executed for applicable adapters.
- [ ] Atlas-targeted checks performed and caveats documented.
- [ ] Clipboard/download fallback behavior validated.
- [ ] Outputs inspected for structural fidelity and citation behavior.

## 7) Packaging and distribution

- [ ] Extension package builds (if included in release).
- [ ] Snippets/bookmarklets are generated from shared source.
- [ ] Userscript build validated (if included).
- [ ] CLI package validates command contracts and exit codes (if included).
- [ ] Native launcher integration verified (if included).

## 8) Final release actions

- [ ] Changelog/notes prepared.
- [ ] Version bumped consistently.
- [ ] Tag created from validated commit.
- [ ] Post-release smoke test performed on release artifacts.

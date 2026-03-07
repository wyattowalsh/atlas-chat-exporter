# Release Checklist

Use this checklist before cutting a release.

## Status

- Repository is currently documentation-first; implementation items are future-facing.

## 1) Scope and changelog hygiene

- [ ] Confirm release scope and version bump rationale.
- [ ] Summarize user-facing changes and migration notes (if any).
- [ ] Confirm no undocumented breaking changes.

## 2) Architecture integrity

- [ ] Adapters still call shared core; no duplicate parsing engines introduced.
- [ ] Package boundaries remain consistent with `docs/architecture.md`.
- [ ] Option behavior remains aligned with `docs/option-matrix.md`.

## 3) Test and validation

- [ ] Unit tests pass for parser utilities and transforms.
- [ ] Golden tests pass for fixture -> markdown.
- [ ] Golden tests pass for fixture -> json.
- [ ] Smoke/integration tests pass for implemented adapters.
- [ ] Failure-path coverage exists for critical errors.

## 4) Fixture coverage

- [ ] Fixtures include simple, long, code-heavy, citation-heavy, nested-list, table-heavy chats.
- [ ] Fixtures include interim status, partial-load, and duplicate-turn cases.
- [ ] Raw DOM and expected markdown/json fixtures are synchronized.

## 5) Security and privacy

- [ ] No telemetry/analytics introduced by default.
- [ ] No hidden network exfiltration in default paths.
- [ ] Adapter permissions follow least-privilege principle.
- [ ] `docs/security-model.md` matches implementation reality.

## 6) Atlas caveat review

- [ ] Atlas-specific limitations are documented in `docs/atlas-notes.md`.
- [ ] Chromium reference behavior validated.
- [ ] Any unsupported Atlas path is explicitly called out.

## 7) Documentation sync

- [ ] `README.md` reflects current adapter support and commands.
- [ ] `docs/architecture.md` matches package boundaries.
- [ ] `docs/decision-log.md` updated for significant choices.
- [ ] `docs/manual-test-plan.md` updated for new scenarios.

## 8) Packaging/release mechanics (once implemented)

- [ ] Workspace build succeeds.
- [ ] Artifacts (extension/snippets/bookmarklets/CLI) generated reproducibly.
- [ ] Checksums/signatures generated where policy requires.
- [ ] Release notes include known limitations and Atlas caveats.

## 9) Final go/no-go

- [ ] All critical checks completed.
- [ ] Remaining risks documented and accepted by maintainer.
- [ ] Tag and publish release.

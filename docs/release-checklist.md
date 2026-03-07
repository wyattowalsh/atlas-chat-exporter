# Release checklist

Use this checklist before publishing any release artifact.

## 1) Quality gates

- [ ] Lint passes.
- [ ] Typecheck passes.
- [ ] Unit tests pass.
- [ ] Fixture/golden tests pass for Markdown + JSON.
- [ ] Adapter smoke tests pass.
- [ ] Documentation updates included for behavior/architecture changes.

## 2) Security + privacy gates

- [ ] No telemetry/analytics code paths introduced without explicit approval.
- [ ] No silent remote upload behavior.
- [ ] Permission changes reviewed and documented.
- [ ] Security-model docs updated if boundaries changed.

## 3) Atlas caveat review

- [ ] `docs/atlas-notes.md` reviewed for known caveats.
- [ ] New Atlas-specific issues documented.
- [ ] Chromium-reference behavior remains correct.

## 4) CI/CD flow and artifact integrity

- [ ] CI build matrix green.
- [ ] Versioned artifacts produced for relevant adapters.
- [ ] Checksums/provenance metadata generated.
- [ ] Release notes drafted with known limitations and caveats.

## 5) Extension zip/crx generation prerequisites

### Prerequisites

- [ ] Production extension build generated from clean workspace.
- [ ] Manifest V3 validated.
- [ ] Version synchronized with release tag.
- [ ] Deterministic ZIP packaging process available.
- [ ] CRX signing key strategy defined (local secure key or CI secret).
- [ ] Signing provenance documented.

### Packaging flow

1. Build extension assets.
2. Create deterministic ZIP from build output.
3. Sign to CRX (if distributing CRX directly).
4. Verify installability and runtime actions (copy/download).
5. Attach ZIP/CRX + checksums to release artifacts.

## 6) Final publication

- [ ] Tag and publish release.
- [ ] Publish/update changelog.
- [ ] Confirm artifact download links.
- [ ] Confirm post-release quick smoke checks.

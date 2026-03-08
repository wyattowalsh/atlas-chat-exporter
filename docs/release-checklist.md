# Release checklist

Use this checklist before publishing any release artifact.

## 1) Repository governance and branch protection

- [ ] `main` is protected with required status checks and CODEOWNERS review.
- [ ] No direct push to `main`; merge via reviewed PR only.
- [ ] `.github/settings.yml`, `.github/CODEOWNERS`, and this checklist remain synchronized.

## 2) Quality gates

- [ ] `pnpm run check:ci-parity` passes.
- [ ] Lint passes.
- [ ] Typecheck passes.
- [ ] Unit tests pass.
- [ ] Fixture/golden tests pass for Markdown + JSON.
- [ ] Adapter smoke tests pass.
- [ ] Documentation updates included for behavior/architecture changes.

## 3) Security + privacy gates

- [ ] No telemetry/analytics code paths introduced without explicit approval.
- [ ] No silent remote upload behavior.
- [ ] Permission changes reviewed and documented.
- [ ] Security-model docs updated if boundaries changed.

## 4) Atlas caveat review

- [ ] `docs/atlas-notes.md` reviewed for known caveats.
- [ ] New Atlas-specific issues documented.
- [ ] Chromium-reference behavior remains correct.

## 5) CI/CD flow and artifact integrity

- [ ] CI and PR checks are green on the release candidate commit.
- [ ] Versioned artifacts produced for relevant adapters.
- [ ] Checksums/provenance metadata generated.
- [ ] Release notes drafted with known limitations and caveats.

## 6) Extension zip/crx generation prerequisites

- [ ] Production extension build generated from clean workspace.
- [ ] Manifest V3 validated.
- [ ] Version synchronized with release tag.
- [ ] Deterministic ZIP packaging process available.
- [ ] `CRX_PRIVATE_KEY_PEM` exists as a repository secret (or approved equivalent).
- [ ] Signing provenance documented.

## 7) Packaging flow

1. Build extension and adapter assets.
2. Create deterministic ZIP from build output.
3. Sign to CRX (if distributing CRX directly).
4. Verify installability and runtime actions (copy/download).
5. Attach ZIP/CRX + checksums to release artifacts.

## 8) Final publication

- [ ] Tag and publish release.
- [ ] Publish/update changelog.
- [ ] Confirm artifact download links.
- [ ] Confirm GitHub Pages update channel publishes:
  - `updates/atlas-chat-exporter-update.xml`
  - `updates/atlas-chat-exporter-extension-v<version>.crx`
- [ ] Confirm update XML points to the released CRX and expected version.
- [ ] Confirm post-release quick smoke checks.

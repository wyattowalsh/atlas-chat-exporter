# Release Checklist

Use this checklist before creating a release/tag.

## 1) Pre-flight

- [ ] Working tree clean.
- [ ] Version/changelog prepared.
- [ ] Required docs updated (`README` + `docs/*`).
- [ ] Atlas caveats reviewed for current release notes.

## 2) CI/CD pipeline requirements

- [ ] Lint passes.
- [ ] Unit tests pass.
- [ ] Fixture/golden tests pass (markdown/json).
- [ ] Build passes for shared packages and adapters.

## 3) Release artifact flow

- [ ] Generate extension build output.
- [ ] Generate extension zip artifact.
- [ ] Generate snippets bundle.
- [ ] Generate bookmarklet bundle.
- [ ] Generate CLI package/binary distribution.
- [ ] Record artifact checksums.

## 4) Extension zip/crx generation prerequisites

### Zip
- [ ] Built extension files include valid `manifest.json`.
- [ ] Background/content scripts and assets are present.
- [ ] Zip is loadable via unpacked-extension equivalence smoke test.

### CRX (if published)
- [ ] Private signing key is available in secure environment.
- [ ] Key is not committed, copied into artifacts, or logged.
- [ ] CRX pack command is reproducible/documented.
- [ ] Produced CRX is signature-valid and installable in target channel.

## 5) Manual validation

- [ ] Run manual smoke tests across priority adapters.
- [ ] Validate local-first behavior (no telemetry/no exfiltration).
- [ ] Validate citation modes and interim-status handling.
- [ ] Validate known Atlas caveats and document any regressions.

## 6) Security review

- [ ] Permissions match documented rationale (`docs/security-model.md`).
- [ ] No new network destinations introduced without explicit approval/docs.
- [ ] No secrets embedded in source bundles/artifacts.

## 7) Publish

- [ ] Tag release.
- [ ] Attach artifacts and checksums.
- [ ] Publish release notes with known limitations and Atlas caveats.
- [ ] Link to manual test evidence and CI run.

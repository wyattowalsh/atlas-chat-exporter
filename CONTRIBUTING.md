# Contributing

Thanks for helping improve **atlas-chat-exporter**.

## Project expectations

This project follows a shared architecture:

- one extraction core, many adapters
- deterministic parser/transform behavior
- local-first defaults (no telemetry, no silent uploads)
- tests + fixtures + docs treated as first-class deliverables

Before opening a PR, read `AGENTS.md` and relevant docs under `docs/`.

## Development guidelines

1. Keep adapters thin; put parsing semantics in shared packages.
2. Prefer additive changes with tests/fixtures over speculative rewrites.
3. Keep behavior deterministic and documented.
4. Handle citations deliberately (`keep` / `normalize` / `strip`).
5. Document Atlas-specific caveats instead of hiding them.

## Pull request requirements

Every PR should include:

- tests added/updated (or an explicit reason if not applicable)
- fixtures added/updated for parser or transform behavior changes
- docs updated to match implementation changes
- confirmation that adapter-core boundaries remain intact
- security/privacy review confirmation (local-only defaults preserved)

Use `.github/PULL_REQUEST_TEMPLATE.md` and complete all required checklist items.

## Suggested workflow

1. Create/identify an issue.
2. For parsing bugs, add or update fixture inputs and golden outputs first.
3. Implement in shared packages where appropriate.
4. Run relevant tests and smoke checks.
5. Update docs and manual validation notes.
6. Open PR with risk and rollback notes.

## Commit style

Use clear, focused commits with imperative titles, for example:

- `Add parsing regression issue template`
- `Document contributor PR checklist requirements`

## Security & privacy

Contributors must avoid introducing:

- telemetry by default
- remote persistence or background sync by default
- hidden data exfiltration paths

If elevated permissions are needed in any adapter, document why and what data is accessed/stored.

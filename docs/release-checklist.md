# Release checklist

## Versioning strategy

- Follow SemVer for all public packages and adapters:
  - `MAJOR`: breaking changes to shared AST, options, or adapter contracts.
  - `MINOR`: backward-compatible features (new flags, transforms, adapters).
  - `PATCH`: bug fixes, fixture updates, and documentation-only updates.
- Keep package versions aligned during the early monorepo phase.
- Record notable parsing/renderer changes in release notes with fixture IDs.

## Preflight checks

Run these commands from the repository root before cutting a release:

1. `pnpm install --frozen-lockfile`
2. `pnpm lint`
3. `pnpm typecheck`
4. `pnpm test`
5. `pnpm fixtures:verify`
6. `pnpm build`

## Fixture and golden integrity

- Confirm every `fixtures/raw-dom/*.html` fixture has matching:
  - `fixtures/expected-md/*.md`
  - `fixtures/expected-json/*.json`
- If parser/transform behavior changed intentionally:
  - update fixtures with `pnpm fixtures:collect`
  - include fixture rationale in changelog/PR notes

## Manual adapter validation matrix

| Adapter | Runtime | Manual checks | Pass criteria |
| --- | --- | --- | --- |
| Chromium extension | Chrome stable | Trigger copy + download actions on a short and citation-heavy chat | Markdown/JSON output downloads and role boundaries preserved |
| DevTools snippets (`copy-chat`, `download-chat`, `inspect-chat-selectors`) | Chrome DevTools | Run each snippet in Atlas and ChatGPT web | Snippets execute without syntax/runtime errors |
| Bookmarklets | Chrome stable | Click bookmarklet on active chat page | Download action succeeds and output is non-empty |
| Userscript | Tampermonkey/Greasemonkey | Toggle options and run export | UI remains non-intrusive and output respects selected options |
| CLI/CDP injector | Node + local Chromium | Run markdown/json export to stdout and file | Exit codes stable; artifacts written correctly |
| Native launcher | Host OS launcher wrapper | Invoke configured launcher action | Launcher calls CLI path and returns expected artifact |

## Release process

1. Complete preflight checks.
2. Complete manual adapter matrix entries relevant to changed surfaces.
3. Bump versions in impacted packages/apps.
4. Update changelog/release notes with:
   - user-facing changes
   - fixture updates
   - Atlas-specific caveats
5. Tag release (`vX.Y.Z`) and push tag.
6. Publish/ship adapter artifacts (extension package, snippets, bookmarklets, CLI package) as applicable.
7. Post-release sanity check:
   - install/use released artifacts in a clean environment
   - verify no telemetry/network behavior was introduced

## Rollback plan

- Revert tag or publish a hotfix patch if regression is confirmed.
- Add a regression fixture before patching parser/transform logic.
- Re-run full preflight + targeted manual adapter validations.

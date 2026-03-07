# atlas-chat-exporter

Local-first toolkit for exporting ChatGPT / Atlas conversations.

## Packaging scripts

### Extension package (`scripts/package-extension.ts`)

Builds a deterministic extension zip artifact:

```bash
npm run package:extension -- --version v1.2.3
```

Default paths:

- input extension build: `apps/extension/dist`
- output directory: `dist/release`
- output zip: `dist/release/atlas-chat-exporter-extension-vX.Y.Z.zip`

Determinism details:

- input files are copied into a temporary staging directory
- file order is sorted lexicographically
- file timestamps are normalized using `SOURCE_DATE_EPOCH`
- zip is built with `zip -X` to reduce metadata variance

### Optional CRX output

If a private key is available (CI secret or local file), the same script can emit a CRX:

```bash
npm run package:extension -- \
  --version v1.2.3 \
  --crx-key ./secrets/extension.pem
```

Outputs:

- `dist/release/atlas-chat-exporter-extension-vX.Y.Z.crx`

Optional update metadata XML can also be generated:

```bash
npm run package:extension -- \
  --version v1.2.3 \
  --crx-key ./secrets/extension.pem \
  --update-base-url https://example.com/updates \
  --extension-id abcdefghijklmnopqrstuvwxyzabcdef
```

This emits:

- `dist/release/atlas-chat-exporter-extension-vX.Y.Z.xml`

If key-based signing is unavailable in CI, use the extension zip with the Chrome Web Store upload/signing flow as the fallback distribution path.

### Release bundle (`scripts/package-release.ts`)

Builds the final release bundle zip:

```bash
npm run package:release -- --version v1.2.3
```

Output:

- `dist/release/atlas-chat-exporter-vX.Y.Z.zip`

Bundle includes (when present):

- `README.md`
- `LICENSE`
- `docs/`
- `apps/snippets/dist/`
- `apps/bookmarklets/dist/`
- `apps/cli/dist/`

## GitHub release artifacts workflow

Workflow: `.github/workflows/release-artifacts.yml`

On Release publish (or manual dispatch), it packages and uploads:

- `atlas-chat-exporter-vX.Y.Z.zip`
- `atlas-chat-exporter-extension-vX.Y.Z.zip`
- `atlas-chat-exporter-extension-vX.Y.Z.crx` (only when `EXTENSION_CRX_PRIVATE_KEY` secret is configured)

### Required/optional CI configuration

- Optional secret: `EXTENSION_CRX_PRIVATE_KEY` (PEM content)
- Optional repo variable: `EXTENSION_UPDATE_BASE_URL`
- Optional repo variable: `EXTENSION_ID`

Without the key secret, the workflow still publishes zip artifacts and skips CRX generation.

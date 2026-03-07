# atlas-chat-exporter

Local-first toolkit for exporting ChatGPT/Atlas conversations while preserving structure.

## Packaging scripts

### Extension package

Use `scripts/package-extension.ts` to produce a deterministic extension archive:

```bash
npx -y tsx scripts/package-extension.ts --version 0.1.0 --extension-dir apps/extension/dist --out-dir dist/release
```

Outputs:

- `atlas-chat-exporter-extension-vX.Y.Z.zip`
- `atlas-chat-exporter-extension-vX.Y.Z.zip.sha256`

#### Optional CRX signing

CRX generation is enabled when a key path is provided:

```bash
CRX_PRIVATE_KEY_PATH=/path/to/extension.pem \
CHROME_BINARY=google-chrome \
CRX_UPDATE_BASE_URL=https://downloads.example.com/atlas \
npx -y tsx scripts/package-extension.ts --version 0.1.0
```

Additional outputs when signing is configured:

- `atlas-chat-exporter-extension-vX.Y.Z.crx`
- `atlas-chat-exporter-extension-vX.Y.Z-update.xml` (only when `CRX_UPDATE_BASE_URL` is set)

If signing is not configured in CI, use Chrome Web Store upload as the fallback distribution path.

### Release package

Use `scripts/package-release.ts` to create the final multi-artifact release bundle:

```bash
npx -y tsx scripts/package-release.ts --version 0.1.0 --out-dir dist/release
```

This creates:

- `atlas-chat-exporter-vX.Y.Z.zip`

The bundle includes docs, snippet/bookmarklet/CLI artifacts (when present), and generated extension artifacts from `dist/release`.

## GitHub Releases automation

`.github/workflows/release.yml` uploads these release assets for tags like `v1.2.3`:

- `atlas-chat-exporter-vX.Y.Z.zip`
- `atlas-chat-exporter-extension-vX.Y.Z.zip`
- `atlas-chat-exporter-extension-vX.Y.Z.crx` (only when signing key is configured)

# Branding Guidelines

## Canonical file contract

Canonical brand assets live in `assets/brand/` with these required filenames:

- `logo-2048.png`
- `logo-1024.png`
- `logo-512.png`
- `logo-256.png`
- `logo-128.png`
- `logo-64.png`
- `logo-32.png`
- `logo-16.png`

These are copied from provided source variants in `assets/brand/source/` by `scripts/regenerate-brand-assets.py`.

## Where each size is used

- `logo-512.png`: README/docs primary logo.
- `logo-256.png`: CLI and native-launcher packaging assets.
- `logo-128.png`: extension large icon/support metadata.
- `logo-64.png`: userscript `@icon64` and fallback extension `48x48` source when no dedicated `logo-48.png` is provided.
- `logo-32.png`: userscript `@icon`, extension icon, favicon variant.
- `logo-16.png`: extension small icon and favicon variant.
- `logo-1024.png` / `logo-2048.png`: archival/high-res distribution assets.

## Do not mutate generated assets manually

**Do not edit or recompress files in `assets/brand/`, `apps/*/assets`, or `assets/favicon/` manually.**

Always update the provided source images and re-run regeneration to keep all surfaces synchronized.

## Regeneration workflow (from master image variants)

1. Put provided source variants into `assets/brand/source/`.
2. Ensure required source files exist (`logo-{2048,1024,512,256,128,64,32,16}.png`).
3. Run regeneration:

   ```bash
   python scripts/regenerate-brand-assets.py
   ```

4. Validate references and dimensions:

   ```bash
   node scripts/verify-brand-assets.ts
   ```

5. Commit updated assets + manifests/docs in one change.

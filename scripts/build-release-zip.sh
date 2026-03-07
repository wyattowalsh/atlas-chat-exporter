#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
STAGE_DIR="$DIST_DIR/release-staging"
OUT_ZIP="$DIST_DIR/atlas-chat-exporter-release.zip"

mkdir -p "$DIST_DIR"
rm -rf "$STAGE_DIR"
mkdir -p "$STAGE_DIR/docs" "$STAGE_DIR/dist"

# Ensure distributables exist.
"$ROOT_DIR/scripts/build-extension-zip.sh"
"$ROOT_DIR/scripts/build-crx.sh" || true

# Include docs and top-level metadata.
cp "$ROOT_DIR/README.md" "$STAGE_DIR/README.md"
cp "$ROOT_DIR/LICENSE" "$STAGE_DIR/LICENSE"

if [[ -d "$ROOT_DIR/docs" ]]; then
  cp -R "$ROOT_DIR/docs/." "$STAGE_DIR/docs/"
fi

cp "$DIST_DIR"/*.zip "$STAGE_DIR/dist/" 2>/dev/null || true
cp "$DIST_DIR"/*.crx "$STAGE_DIR/dist/" 2>/dev/null || true

(cd "$STAGE_DIR" && zip -qr "$OUT_ZIP" .)

echo "Created release bundle: $OUT_ZIP"

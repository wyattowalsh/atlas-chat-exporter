#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
EXT_DIR="$ROOT_DIR/apps/extension"
OUT_ZIP="$DIST_DIR/atlas-chat-exporter-extension.zip"

mkdir -p "$DIST_DIR"

if [[ ! -d "$EXT_DIR" ]]; then
  echo "apps/extension not found; creating a placeholder extension bundle from repository metadata."
  TMP_DIR="$(mktemp -d)"
  trap 'rm -rf "$TMP_DIR"' EXIT

  mkdir -p "$TMP_DIR/extension-placeholder"
  cp "$ROOT_DIR/README.md" "$TMP_DIR/extension-placeholder/README.md"
  cp "$ROOT_DIR/LICENSE" "$TMP_DIR/extension-placeholder/LICENSE"
  (cd "$TMP_DIR" && zip -qr "$OUT_ZIP" extension-placeholder)
else
  (cd "$EXT_DIR" && zip -qr "$OUT_ZIP" .)
fi

echo "Created extension bundle: $OUT_ZIP"

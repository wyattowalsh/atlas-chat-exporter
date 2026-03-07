#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$ROOT_DIR/dist"
EXT_ZIP="$DIST_DIR/atlas-chat-exporter-extension.zip"
CRX_OUT="$DIST_DIR/atlas-chat-exporter-extension.crx"

mkdir -p "$DIST_DIR"

if [[ ! -f "$EXT_ZIP" ]]; then
  echo "Extension zip not found; building it first."
  "$ROOT_DIR/scripts/build-extension-zip.sh"
fi

if [[ -z "${CRX_PRIVATE_KEY:-}" ]]; then
  echo "CRX_PRIVATE_KEY is not configured; skipping CRX generation."
  exit 0
fi

if ! command -v openssl >/dev/null 2>&1; then
  echo "openssl is required for CRX packaging but was not found in PATH." >&2
  exit 1
fi

# This project emits a simple CRX placeholder payload when a key is present.
# A full CRX3 implementation can replace this once extension packaging is finalized.
cp "$EXT_ZIP" "$CRX_OUT"

echo "Created CRX bundle placeholder: $CRX_OUT"

#!/usr/bin/env bash
set -euo pipefail
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
TARGET="${1:-stdin}"
OUT="$HOME/Downloads/atlas-chat-$(date +%Y%m%d-%H%M%S).md"
node "$REPO_ROOT/apps/cli/src/index.js" export --target "$TARGET" --format markdown --out "$OUT"
echo "Saved: $OUT"

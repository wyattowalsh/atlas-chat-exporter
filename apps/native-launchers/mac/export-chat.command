#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT_DIR"

if [ ! -f apps/cli/dist/atlas-cli.mjs ]; then
  npm run build:cli
fi

OUTPUT_FILE="$HOME/Desktop/chat-export-$(date +%Y%m%d-%H%M%S).md"
node apps/cli/dist/atlas-cli.mjs download --file "$OUTPUT_FILE"
echo "Saved export to: $OUTPUT_FILE"

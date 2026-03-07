#!/usr/bin/env bash
# Required parameters:
# @raycast.schemaVersion 1
# @raycast.title Export Current Chat (Atlas)
# @raycast.mode compact

set -euo pipefail

HTML_FILE="${TMPDIR:-/tmp}/atlas-current-chat.html"
pbpaste > "$HTML_FILE"
atlas-export export --html-file="$HTML_FILE" > "${TMPDIR:-/tmp}/atlas-export.md"
open -a TextEdit "${TMPDIR:-/tmp}/atlas-export.md"
echo "Exported to ${TMPDIR:-/tmp}/atlas-export.md"

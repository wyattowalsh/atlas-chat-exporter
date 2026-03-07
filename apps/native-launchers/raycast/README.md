# Raycast Launcher Integration

This launcher is a polished shell-out integration:

1. Install the CLI (`apps/cli/src/atlas-export.js`) on your PATH as `atlas-export`.
2. Add this script as a Raycast command.
3. Trigger the command to save a Markdown export to `~/Downloads/chat-export.md`.

The launcher does not parse DOM or transform content itself; it delegates fully to the CLI/core pipeline.

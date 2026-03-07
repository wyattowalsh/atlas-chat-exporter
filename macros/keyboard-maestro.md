# Keyboard Maestro recipe

1. Trigger: hotkey `⌃⌥⌘E`.
2. Action: Execute Shell Script:
```bash
cd /workspace/atlas-chat-exporter
node apps/cli/src/index.js export --target "$KMVAR_InputFile" --format markdown --out "$HOME/Downloads/atlas-chat.md"
```
3. Optional: Display notification with output path.

This macro is a wrapper only; extraction semantics come from `packages/core`.

# BetterTouchTool (optional)

Use a **Run Script / Task** action that invokes:
```bash
cd /workspace/atlas-chat-exporter
node apps/cli/src/index.js export --target /path/to/captured-chat.txt --format markdown --out "$HOME/Downloads/atlas-chat.md"
```

BTT remains a thin wrapper around the CLI.

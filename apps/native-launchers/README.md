# Native launcher integrations

## macOS Shortcut + shell launcher (polished baseline)

This launcher runs the shared CLI (which consumes `packages/core`) and writes output to a chosen file.

### Files
- `macos/run-atlas-export.sh`
- `macos/atlas-export.shortcut-notes.md`

### Quick start
1. Make sure Node can run `apps/cli/src/index.js`.
2. In Shortcuts, create a shortcut with:
   - Ask for Text (prompt: input file path or `stdin`)
   - Run Shell Script:
     ```bash
     /path/to/repo/apps/native-launchers/macos/run-atlas-export.sh "$Shortcut Input"
     ```
3. Pin shortcut to menu bar / keyboard hotkey.

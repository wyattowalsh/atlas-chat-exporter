# Native launchers

`mac/export-chat.command` is a polished macOS launcher wrapper around the CLI.

- Double click (or bind in Alfred/Keyboard Maestro) to trigger export.
- The launcher only shells into `apps/cli/dist/atlas-cli.mjs`.
- Parsing/rendering remains in shared packages.

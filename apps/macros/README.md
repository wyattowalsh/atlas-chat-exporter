# Macro Recipes

## Keyboard Maestro

1. Trigger: hotkey (for example `⌘⇧E`).
2. Action 1: Execute Shell Script:
   ```bash
   atlas-export export --html-file="$KMVAR_TempHtml" > "$KMVAR_OutputFile"
   ```
3. Action 2: Copy or open output file.
4. Optional: pre-step in browser to copy DOM HTML to clipboard and write to `$KMVAR_TempHtml`.

## Hammerspoon

```lua
hs.hotkey.bind({"cmd", "shift"}, "E", function()
  local htmlPath = os.getenv("TMPDIR") .. "/atlas-chat.html"
  local outPath = os.getenv("TMPDIR") .. "/atlas-export.md"
  hs.execute(string.format("atlas-export export --html-file='%s' > '%s'", htmlPath, outPath), true)
  hs.alert.show("Atlas export complete")
end)
```

> BetterTouchTool can call the same `atlas-export` CLI command if desired.

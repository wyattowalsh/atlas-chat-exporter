# Keyboard Maestro Recipes

## Copy current chat
1. Trigger: hotkey (`⌃⌥⌘C`).
2. Action: Execute JavaScript in Chrome DevTools snippet runner for `copy-chat`.
3. Fallback action: notify if clipboard permissions are blocked.

## Download current chat
1. Trigger: hotkey (`⌃⌥⌘D`).
2. Action: Execute `download-chat` snippet.
3. Optional action: reveal downloaded file in Finder.

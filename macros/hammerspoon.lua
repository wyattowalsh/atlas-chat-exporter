-- Hammerspoon recipe: wrapper around CLI
hs.hotkey.bind({"ctrl", "alt", "cmd"}, "E", function()
  local cmd = "cd /workspace/atlas-chat-exporter && node apps/cli/src/index.js export --target stdin --format markdown > ~/Downloads/atlas-chat.md"
  hs.execute(cmd)
  hs.notify.new({title="Atlas Export", informativeText="Saved ~/Downloads/atlas-chat.md"}):send()
end)

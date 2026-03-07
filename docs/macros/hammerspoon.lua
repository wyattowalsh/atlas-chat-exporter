-- Hammerspoon wrapper macros for atlas snippets
local function runSnippet(name)
  hs.osascript.javascript([[Application("Google Chrome").activate();]])
  hs.eventtap.keyStroke({"cmd", "opt"}, "j") -- open DevTools command menu (example)
  hs.alert.show("Run snippet: " .. name)
end

hs.hotkey.bind({"ctrl", "alt", "cmd"}, "C", function() runSnippet("copy-chat") end)
hs.hotkey.bind({"ctrl", "alt", "cmd"}, "D", function() runSnippet("download-chat") end)

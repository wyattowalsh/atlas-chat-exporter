import { exportFromDocument } from "@atlas/core";

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    if (msg.type !== "copy" && msg.type !== "download") return sendResponse({ ok: false, error: "Unsupported action" });
    const payload = exportFromDocument(document, msg.settings, "chatgpt-atlas");

    if (msg.type === "copy") {
      await navigator.clipboard.writeText(payload.output);
      return sendResponse({ ok: true });
    }

    const blob = new Blob([payload.output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `atlas-export.${msg.settings.outputFormat === "json" ? "json" : "md"}`;
    a.click();
    URL.revokeObjectURL(url);
    return sendResponse({ ok: true });
  })().catch((error) => sendResponse({ ok: false, error: error.message }));

  return true;
});

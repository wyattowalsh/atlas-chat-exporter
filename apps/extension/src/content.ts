import { extractConversationFromDocument, renderJson, renderMarkdown } from "../../../packages/core/src/index.js";
import { defaultExportOptions, ExportOptions } from "../../../packages/shared/src/types.js";

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type !== "atlas:export") return;

  const options = { ...defaultExportOptions, ...(msg.options as Partial<ExportOptions>) };
  const conversation = extractConversationFromDocument(document, options);
  const text = options.outputFormat === "json" ? renderJson(conversation) : renderMarkdown(conversation, options);

  if (msg.action === "copy") {
    navigator.clipboard.writeText(text).then(
      () => sendResponse({ ok: true }),
      (error) => sendResponse({ ok: false, error: String(error) })
    );
    return true;
  }

  if (msg.action === "download") {
    const blob = new Blob([text], { type: "text/plain" });
    const filename = options.filenameTemplate ?? `chat-export.${options.outputFormat === "json" ? "json" : "md"}`;
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
    sendResponse({ ok: true });
  }
});

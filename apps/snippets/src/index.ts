import { DEFAULT_EXPORT_OPTIONS } from '../../../packages/shared/src/index.js';

export function snippetRuntime(action: 'copy' | 'download'): string {
  const optionsLiteral = JSON.stringify(DEFAULT_EXPORT_OPTIONS);

  return `(() => {
  const runtime = window.__atlasExportHook;
  if (typeof runtime !== "function") {
    console.error("Atlas export runtime hook is not available in this page context.");
    return;
  }

  const result = runtime(${optionsLiteral});
  const content = typeof result === "string" ? result : (result && result.content) || "";

  if (${JSON.stringify(action)} === "copy") {
    navigator.clipboard.writeText(content).then(() => console.log("Atlas export copied"));
    return;
  }

  const blob = new Blob([content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "atlas-chat-export.md";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 300);
})();`;
}

export function inspectChatSelectorsSnippet(): string {
  return `(() => {
  const selectors = ["article", "[data-message-author-role]", "[data-role]", "main"];
  const report = selectors.map((selector) => ({ selector, count: document.querySelectorAll(selector).length }));
  console.table(report);
  return report;
})();`;
}

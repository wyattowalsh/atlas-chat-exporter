(async () => {
  const core = window.__ATLAS_CORE__;
  if (!core?.exportFromDocument) throw new Error("Atlas core not loaded");
  const result = core.exportFromDocument(document, { outputFormat: "markdown" }, "chatgpt-atlas");
  const blob = new Blob([result.output], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "atlas-export.md"; a.click();
  URL.revokeObjectURL(url);
})();

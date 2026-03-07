(async () => {
  const core = window.__ATLAS_CORE__;
  if (!core?.exportFromDocument) throw new Error("Atlas core not loaded");
  const result = core.exportFromDocument(document, { outputFormat: "markdown" }, "chatgpt-atlas");
  await navigator.clipboard.writeText(result.output);
  console.log("Copied chat export");
})();

import { defaultExportOptions, ExportOptions } from "../../../packages/shared/src/types.js";

const includeRoleHeadings = document.getElementById("includeRoleHeadings") as HTMLInputElement;
const includeHorizontalRules = document.getElementById("includeHorizontalRules") as HTMLInputElement;
const citationMode = document.getElementById("citationMode") as HTMLSelectElement;
const copyButton = document.getElementById("copyButton") as HTMLButtonElement;
const downloadButton = document.getElementById("downloadButton") as HTMLButtonElement;

initialize().catch(console.error);

async function initialize() {
  const settings = await chrome.runtime.sendMessage({ type: "atlas:get-settings" });
  const opts = { ...defaultExportOptions, ...(settings as Partial<ExportOptions>) };

  includeRoleHeadings.checked = opts.includeRoleHeadings;
  includeHorizontalRules.checked = opts.includeHorizontalRules;
  citationMode.value = opts.citationMode;

  [includeRoleHeadings, includeHorizontalRules, citationMode].forEach((control) => {
    control.addEventListener("change", persistSettings);
  });

  copyButton.addEventListener("click", () => execute("copy"));
  downloadButton.addEventListener("click", () => execute("download"));
}

async function persistSettings() {
  const opts = readOptions();
  await chrome.runtime.sendMessage({ type: "atlas:set-settings", options: opts });
}

async function execute(action: "copy" | "download") {
  const options = readOptions();
  await chrome.runtime.sendMessage({ type: "atlas:action", action, options });
  window.close();
}

function readOptions(): Partial<ExportOptions> {
  return {
    includeRoleHeadings: includeRoleHeadings.checked,
    includeHorizontalRules: includeHorizontalRules.checked,
    citationMode: citationMode.value as ExportOptions["citationMode"]
  };
}

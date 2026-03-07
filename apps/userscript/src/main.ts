import { extractConversationFromDocument, renderMarkdown } from "../../../packages/core/src/index.js";
import { defaultExportOptions, ExportOptions } from "../../../packages/shared/src/types.js";

const STORAGE_KEY = "atlas-userscript-options";

init();

function init() {
  const button = document.createElement("button");
  button.textContent = "Export chat";
  Object.assign(button.style, {
    position: "fixed",
    right: "12px",
    bottom: "12px",
    zIndex: "9999",
    padding: "8px 10px"
  });

  button.addEventListener("click", async () => {
    const options = await readOptions();
    const conversation = extractConversationFromDocument(document, options);
    const markdown = renderMarkdown(conversation, options);
    await navigator.clipboard.writeText(markdown);
    button.textContent = "Copied!";
    setTimeout(() => (button.textContent = "Export chat"), 1200);
  });

  button.addEventListener("contextmenu", async (event) => {
    event.preventDefault();
    const options = await readOptions();
    const next = {
      ...options,
      citationMode: options.citationMode === "normalize" ? "strip" : "normalize"
    };
    await writeOptions(next);
    button.title = `citationMode=${next.citationMode}`;
  });

  document.body.append(button);
}

async function readOptions(): Promise<ExportOptions> {
  const current = await gmGet(STORAGE_KEY);
  return { ...defaultExportOptions, ...(current ?? {}) };
}

async function writeOptions(options: ExportOptions) {
  await gmSet(STORAGE_KEY, options);
}

function gmGet(key: string): Promise<unknown> {
  const maybe = (globalThis as { GM_getValue?: (k: string) => unknown }).GM_getValue;
  return Promise.resolve(maybe ? maybe(key) : localStorage.getItem(key)).then((value) => {
    if (typeof value === "string") {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    }
    return value;
  });
}

function gmSet(key: string, value: unknown): Promise<void> {
  const maybe = (globalThis as { GM_setValue?: (k: string, v: unknown) => void }).GM_setValue;
  if (maybe) {
    maybe(key, value);
    return Promise.resolve();
  }
  localStorage.setItem(key, JSON.stringify(value));
  return Promise.resolve();
}

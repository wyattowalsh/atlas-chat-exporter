// ==UserScript==
// @name         Atlas Chat Exporter
// @namespace    local.atlas
// @version      0.1.0
// @match        https://chatgpt.com/*
// @match        https://chat.openai.com/*
// @grant        none
// ==/UserScript==

import { exportFromDocument } from "@atlas/core";
import { DEFAULT_EXPORT_OPTIONS } from "@atlas/shared";

const STORAGE_KEY = "atlas.userscript.settings";
const settings = { ...DEFAULT_EXPORT_OPTIONS, ...(JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")) };

const root = document.createElement("div");
root.style.cssText = "position:fixed;bottom:12px;right:12px;z-index:99999;background:#111;color:#fff;padding:8px;border-radius:8px;font:12px sans-serif;opacity:0.8";
root.innerHTML = `<button id=atlas-copy style='margin-right:6px'>Copy</button><button id=atlas-download>Download</button>`;
document.body.appendChild(root);

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

root.querySelector("#atlas-copy").onclick = async () => {
  const result = exportFromDocument(document, settings, "chatgpt-atlas");
  await navigator.clipboard.writeText(result.output);
};

root.querySelector("#atlas-download").onclick = async () => {
  const result = exportFromDocument(document, settings, "chatgpt-atlas");
  const blob = new Blob([result.output], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "atlas-export.md";
  a.click();
  URL.revokeObjectURL(url);
};

persist();

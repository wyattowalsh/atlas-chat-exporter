// ==UserScript==
// @name         Atlas Chat Exporter
// @namespace    local.atlas.exporter
// @version      0.1.0
// @description  Minimal export menu backed by shared core
// @match        https://chatgpt.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

import { exportConversation } from "../../packages/core/src/index.js";

(function () {
  const root = document.createElement("div");
  root.style.position = "fixed";
  root.style.bottom = "16px";
  root.style.right = "16px";
  root.style.zIndex = "2147483647";
  root.style.background = "rgba(0,0,0,0.7)";
  root.style.color = "white";
  root.style.padding = "8px";
  root.style.borderRadius = "8px";

  const select = document.createElement("select");
  select.innerHTML = `<option value="markdown">md</option><option value="json">json</option>`;
  select.value = GM_getValue("format", "markdown");
  select.onchange = () => GM_setValue("format", select.value);

  const copy = document.createElement("button");
  copy.textContent = "Copy chat";
  copy.onclick = async () => {
    const { output } = exportConversation(document.body?.innerText ?? "", { outputFormat: select.value });
    await navigator.clipboard.writeText(output);
  };

  root.append(select, copy);
  document.body.append(root);
})();

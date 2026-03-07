const formatSelect = document.getElementById("format");
const copyButton = document.getElementById("copy");
const downloadButton = document.getElementById("download");

chrome.storage.local.get({ format: "markdown" }, ({ format }) => {
  formatSelect.value = format;
});

formatSelect.addEventListener("change", () => {
  chrome.storage.local.set({ format: formatSelect.value });
});

function trigger(action) {
  chrome.runtime.sendMessage({ action, format: formatSelect.value });
}

copyButton.addEventListener("click", () => trigger("copy"));
downloadButton.addEventListener("click", () => trigger("download"));

const byId = (id) => document.getElementById(id);
const SETTINGS_KEY = "atlas-export-settings";

async function load() {
  const { [SETTINGS_KEY]: settings } = await chrome.storage.sync.get(SETTINGS_KEY);
  if (settings) {
    byId("outputFormat").value = settings.outputFormat;
    byId("citationMode").value = settings.citationMode;
  }
}

async function save() {
  const settings = {
    outputFormat: byId("outputFormat").value,
    citationMode: byId("citationMode").value
  };
  await chrome.runtime.sendMessage({ type: "saveSettings", settings });
  return settings;
}

byId("copy").onclick = async () => { await save(); await chrome.runtime.sendMessage({ type: "copy" }); };
byId("download").onclick = async () => { await save(); await chrome.runtime.sendMessage({ type: "download" }); };

load();

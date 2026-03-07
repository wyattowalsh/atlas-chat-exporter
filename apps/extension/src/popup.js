import { DEFAULT_OPTIONS } from '../../../packages/core/src/index.js';

const formatEl = document.getElementById('format');
const headingsEl = document.getElementById('headings');
const statusEl = document.getElementById('status');

await chrome.storage.local.get(['atlasSettings']).then(({ atlasSettings }) => {
  const settings = { ...DEFAULT_OPTIONS, ...atlasSettings };
  formatEl.value = settings.outputFormat;
  headingsEl.checked = settings.includeRoleHeadings;
});

async function saveSettings() {
  const atlasSettings = {
    outputFormat: formatEl.value,
    includeRoleHeadings: headingsEl.checked
  };
  await chrome.storage.local.set({ atlasSettings });
  return atlasSettings;
}

async function run(action) {
  const atlasSettings = await saveSettings();
  await chrome.runtime.sendMessage({ type: 'RUN_EXPORT', action, options: atlasSettings });
  statusEl.textContent = `${action} requested`;
}

document.getElementById('copy').addEventListener('click', () => run('copy'));
document.getElementById('download').addEventListener('click', () => run('download'));

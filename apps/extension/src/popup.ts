import {
  DEFAULT_EXPORT_OPTIONS,
  resolveExportOptions,
  type ExportOptions
} from '../../../packages/shared/src/index.js';

interface PopupChromeApi {
  runtime?: {
    sendMessage: (payload: unknown) => Promise<unknown>;
  };
}

const chromeApi = (globalThis as { chrome?: PopupChromeApi }).chrome;

const includeRoleHeadings = document.getElementById('includeRoleHeadings') as HTMLInputElement;
const includeHorizontalRules = document.getElementById(
  'includeHorizontalRules'
) as HTMLInputElement;
const citationMode = document.getElementById('citationMode') as HTMLSelectElement;
const copyButton = document.getElementById('copyButton') as HTMLButtonElement;
const downloadButton = document.getElementById('downloadButton') as HTMLButtonElement;

initialize().catch((error) => console.error(error));

async function initialize(): Promise<void> {
  if (!chromeApi?.runtime) {
    return;
  }
  const settings = (await chromeApi.runtime.sendMessage({
    type: 'atlas:get-settings'
  })) as Partial<ExportOptions>;
  const opts = resolveExportOptions({ ...DEFAULT_EXPORT_OPTIONS, ...settings });

  includeRoleHeadings.checked = opts.includeRoleHeadings;
  includeHorizontalRules.checked = opts.includeHorizontalRules;
  citationMode.value = opts.citationMode;

  [includeRoleHeadings, includeHorizontalRules, citationMode].forEach((control) => {
    control.addEventListener('change', persistSettings);
  });

  copyButton.addEventListener('click', () => execute('copy'));
  downloadButton.addEventListener('click', () => execute('download'));
}

async function persistSettings(): Promise<void> {
  if (!chromeApi?.runtime) {
    return;
  }
  const opts = readOptions();
  await chromeApi.runtime.sendMessage({ type: 'atlas:set-settings', options: opts });
}

async function execute(action: 'copy' | 'download'): Promise<void> {
  if (!chromeApi?.runtime) {
    return;
  }
  await chromeApi.runtime.sendMessage({ type: 'atlas:action', action, options: readOptions() });
  window.close();
}

function readOptions(): Partial<ExportOptions> {
  return {
    includeRoleHeadings: includeRoleHeadings.checked,
    includeHorizontalRules: includeHorizontalRules.checked,
    citationMode: citationMode.value as ExportOptions['citationMode']
  };
}

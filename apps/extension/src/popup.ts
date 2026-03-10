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
type RuntimeActionResponse = {
  ok?: boolean;
  error?: string;
};

const chromeApi = (globalThis as { chrome?: PopupChromeApi }).chrome;

const includeRoleHeadings = document.getElementById('includeRoleHeadings') as HTMLInputElement;
const includeHorizontalRules = document.getElementById(
  'includeHorizontalRules'
) as HTMLInputElement;
const citationMode = document.getElementById('citationMode') as HTMLSelectElement;
const copyButton = document.getElementById('copyButton') as HTMLButtonElement;
const downloadButton = document.getElementById('downloadButton') as HTMLButtonElement;
const statusNode = document.getElementById('status') as HTMLDivElement;

initialize().catch((error) => {
  console.error(error);
  setStatus(errorMessage(error), true);
});

async function initialize(): Promise<void> {
  if (!chromeApi?.runtime) {
    setStatus('Chrome runtime API is unavailable.', true);
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
  setStatus('');
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
    setStatus('Chrome runtime API is unavailable.', true);
    return;
  }

  const inFlightLabel = action === 'copy' ? 'Copying export...' : 'Preparing download...';
  setBusy(true);
  setStatus(inFlightLabel);

  try {
    const response = (await chromeApi.runtime.sendMessage({
      type: 'atlas:action',
      action,
      options: readOptions()
    })) as RuntimeActionResponse;

    if (response?.ok !== true) {
      throw new Error(response?.error || 'Export failed.');
    }

    window.close();
  } catch (error) {
    setStatus(errorMessage(error), true);
  } finally {
    setBusy(false);
  }
}

function readOptions(): Partial<ExportOptions> {
  return {
    includeRoleHeadings: includeRoleHeadings.checked,
    includeHorizontalRules: includeHorizontalRules.checked,
    citationMode: citationMode.value as ExportOptions['citationMode']
  };
}

function setBusy(value: boolean): void {
  copyButton.disabled = value;
  downloadButton.disabled = value;
  includeRoleHeadings.disabled = value;
  includeHorizontalRules.disabled = value;
  citationMode.disabled = value;
}

function setStatus(message: string, isError = false): void {
  statusNode.textContent = message;
  statusNode.classList.toggle('error', isError);
}

function errorMessage(error: unknown): string {
  const message = String((error as { message?: unknown })?.message ?? error ?? '');
  return message.trim() || 'Export failed.';
}

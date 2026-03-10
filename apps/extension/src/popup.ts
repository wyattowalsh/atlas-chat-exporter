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

type ActionType = 'copy' | 'download';
type StatusTone = 'info' | 'working' | 'success' | 'error';

const chromeApi = (globalThis as { chrome?: PopupChromeApi }).chrome;

const includeRoleHeadings = document.getElementById('includeRoleHeadings') as HTMLInputElement;
const includeHorizontalRules = document.getElementById(
  'includeHorizontalRules'
) as HTMLInputElement;
const citationMode = document.getElementById('citationMode') as HTMLSelectElement;
const copyButton = document.getElementById('copyButton') as HTMLButtonElement;
const downloadButton = document.getElementById('downloadButton') as HTMLButtonElement;
const statusNode = document.getElementById('status') as HTMLDivElement;

const ACTION_LABELS: Record<ActionType, { idle: string; working: string; success: string }> = {
  copy: {
    idle: 'Copy Markdown',
    working: 'Copying...',
    success: 'Copied'
  },
  download: {
    idle: 'Download File',
    working: 'Preparing...',
    success: 'Download Started'
  }
};

initialize().catch((error) => {
  console.error(error);
  setStatus(normalizeErrorMessage(error), 'error');
});

async function initialize(): Promise<void> {
  if (!chromeApi?.runtime) {
    setStatus('Chrome extension runtime is unavailable in this popup.', 'error');
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
  resetActionLabels();
  setStatus('Ready. Choose Copy or Download.', 'info');
}

async function persistSettings(): Promise<void> {
  if (!chromeApi?.runtime) {
    return;
  }

  try {
    const opts = readOptions();
    await chromeApi.runtime.sendMessage({ type: 'atlas:set-settings', options: opts });
  } catch (error) {
    setStatus(`Could not save options: ${normalizeErrorMessage(error)}`, 'error');
  }
}

async function execute(action: ActionType): Promise<void> {
  if (!chromeApi?.runtime) {
    setStatus('Chrome extension runtime is unavailable in this popup.', 'error');
    return;
  }

  setBusy(true, action);
  setStatus(
    action === 'copy'
      ? 'Copying current conversation to clipboard...'
      : 'Preparing markdown file download...',
    'working'
  );

  try {
    const response = (await chromeApi.runtime.sendMessage({
      type: 'atlas:action',
      action,
      options: readOptions()
    })) as RuntimeActionResponse;

    if (response?.ok !== true) {
      throw new Error(response?.error || 'Unknown export action failure.');
    }

    setStatus(
      action === 'copy'
        ? 'Copied export to clipboard successfully.'
        : 'Download triggered. Check your browser downloads tray.',
      'success'
    );
    setActionSuccessLabel(action);
  } catch (error) {
    setStatus(normalizeErrorMessage(error), 'error');
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

function setBusy(value: boolean, action?: ActionType): void {
  copyButton.disabled = value;
  downloadButton.disabled = value;
  includeRoleHeadings.disabled = value;
  includeHorizontalRules.disabled = value;
  citationMode.disabled = value;

  resetActionLabels();
  if (value && action) {
    setButtonTitle(action, ACTION_LABELS[action].working);
  }
}

function setActionSuccessLabel(action: ActionType): void {
  setButtonTitle(action, ACTION_LABELS[action].success);
  globalThis.setTimeout(() => {
    resetActionLabels();
  }, 1400);
}

function resetActionLabels(): void {
  setButtonTitle('copy', ACTION_LABELS.copy.idle);
  setButtonTitle('download', ACTION_LABELS.download.idle);
}

function setButtonTitle(action: ActionType, text: string): void {
  const button = action === 'copy' ? copyButton : downloadButton;
  const titleEl = button.querySelector('.title');
  if (titleEl) {
    titleEl.textContent = text;
  }
}

function setStatus(message: string, tone: StatusTone): void {
  statusNode.textContent = message;
  statusNode.className = tone;
}

function normalizeErrorMessage(error: unknown): string {
  const raw = String((error as { message?: unknown })?.message ?? error ?? '').trim();
  const message = raw.replace(/^error:\s*/i, '');

  if (!message || /unknown error/i.test(message)) {
    return 'Unknown browser error while exporting. Reload the chat tab, then try again.';
  }

  if (/No active tab found/i.test(message)) {
    return 'No active tab detected. Focus a ChatGPT/Atlas tab and retry.';
  }

  if (/receiving end does not exist|could not establish connection/i.test(message)) {
    return 'Exporter could not attach to this tab. Reload the chat page and retry.';
  }

  if (/No conversation turns found/i.test(message)) {
    return 'No conversation content detected yet. Scroll the full thread into view and retry.';
  }

  if (/clipboard/i.test(message)) {
    return 'Clipboard is blocked in this context. Use Download instead.';
  }

  return message;
}

import { exportConversation } from '../../../packages/core/src/index.js';
import { resolveExportOptions, type ExportOptions } from '../../../packages/shared/src/index.js';

type ExtensionAction = 'copy' | 'download';
type ExtensionMessage = {
  type?: string;
  action?: ExtensionAction;
  options?: Partial<ExportOptions>;
};

interface ChromeApi {
  runtime?: {
    onMessage?: {
      addListener(
        listener: (
          msg: ExtensionMessage,
          sender: unknown,
          sendResponse: (value: unknown) => void
        ) => boolean | void
      ): void;
    };
  };
}

const chromeApi = (globalThis as { chrome?: ChromeApi }).chrome;
const DOWNLOAD_REVOKE_DELAY_MS = 3000;

export function exportFromCurrentDocument(options?: Partial<ExportOptions>) {
  return exportConversation({
    root: document,
    options: resolveExportOptions(options),
    context: {
      locationHref: globalThis.location?.href,
      documentTitle: document.title
    }
  });
}

export async function copyFromCurrentDocument(options?: Partial<ExportOptions>): Promise<void> {
  const result = exportFromCurrentDocument(options);
  await copyTextWithFallback(result.content);
}

export function downloadFromCurrentDocument(options?: Partial<ExportOptions>): void {
  const result = exportFromCurrentDocument(options);
  const filename = options?.filenameTemplate?.trim()
    ? options.filenameTemplate
    : result.suggestedFilename;
  triggerDownload(result.content, result.mimeType, filename);
}

export async function copyTextWithFallback(text: string): Promise<void> {
  const maybeCopyFn = (globalThis as { copy?: unknown }).copy;
  if (typeof maybeCopyFn === 'function') {
    try {
      maybeCopyFn(text);
      return;
    } catch {
      // Fall through to clipboard APIs.
    }
  }

  try {
    if (globalThis.navigator?.clipboard?.writeText) {
      await globalThis.navigator.clipboard.writeText(text);
      return;
    }
  } catch {
    // Fall through to execCommand fallback.
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.pointerEvents = 'none';

  const container = document.body ?? document.documentElement;
  container.appendChild(textarea);
  try {
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    const copied = document.execCommand?.('copy');
    if (copied) {
      return;
    }
  } finally {
    textarea.remove();
  }

  throw new Error('Clipboard copy failed in this page context.');
}

export function triggerDownload(content: string, mimeType: string, filename: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';

  const container = document.body ?? document.documentElement;
  container.appendChild(anchor);

  try {
    anchor.click();
  } finally {
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), DOWNLOAD_REVOKE_DELAY_MS);
  }
}

if (chromeApi?.runtime?.onMessage) {
  chromeApi.runtime.onMessage.addListener(
    (msg: ExtensionMessage, _sender: unknown, sendResponse: (value: unknown) => void) => {
      if (msg.type !== 'atlas:export' || !msg.action) {
        return;
      }

      if (msg.action === 'copy') {
        copyFromCurrentDocument(msg.options).then(
          () => sendResponse({ ok: true }),
          (error) => sendResponse({ ok: false, error: normalizeRuntimeError(error) })
        );
        return true;
      }

      if (msg.action === 'download') {
        try {
          downloadFromCurrentDocument(msg.options);
          sendResponse({ ok: true });
        } catch (error) {
          sendResponse({ ok: false, error: normalizeRuntimeError(error) });
        }
      }
    }
  );
}

function normalizeRuntimeError(error: unknown): string {
  const raw = String((error as { message?: unknown })?.message ?? error ?? '').trim();
  const message = raw.replace(/^error:\s*/i, '');
  if (!message || /unknown error/i.test(message)) {
    return 'Unknown browser error while exporting in page context.';
  }
  return message;
}

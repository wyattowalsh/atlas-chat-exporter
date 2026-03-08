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
  await navigator.clipboard.writeText(result.content);
}

export function downloadFromCurrentDocument(options?: Partial<ExportOptions>): void {
  const result = exportFromCurrentDocument(options);
  const blob = new Blob([result.content], { type: result.mimeType });
  const filename = options?.filenameTemplate?.trim()
    ? options.filenameTemplate
    : result.suggestedFilename;

  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
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
          (error) => sendResponse({ ok: false, error: String(error) })
        );
        return true;
      }

      if (msg.action === 'download') {
        try {
          downloadFromCurrentDocument(msg.options);
          sendResponse({ ok: true });
        } catch (error) {
          sendResponse({ ok: false, error: String(error) });
        }
      }
    }
  );
}

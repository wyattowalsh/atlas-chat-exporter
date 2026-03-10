import {
  DEFAULT_EXPORT_OPTIONS,
  resolveExportOptions,
  type ExportOptions
} from '../../../packages/shared/src/index.js';

type ExtensionAction = 'copy' | 'download';
type ExtensionMessage = {
  type?: string;
  action?: ExtensionAction;
  options?: Partial<ExportOptions>;
};
type ExportDispatchResponse = {
  ok?: boolean;
  error?: string;
};

interface ChromeApi {
  commands?: {
    onCommand: {
      addListener(listener: (command: string) => void | Promise<void>): void;
    };
  };
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
  storage: {
    local: {
      get(key: string): Promise<Record<string, unknown>>;
      set(value: Record<string, unknown>): Promise<void>;
    };
  };
  tabs: {
    query(queryInfo: { active: boolean; currentWindow: boolean }): Promise<Array<{ id?: number }>>;
    sendMessage(
      tabId: number,
      payload: { type: 'atlas:export'; action: ExtensionAction; options: ExportOptions }
    ): Promise<ExportDispatchResponse | undefined>;
  };
  scripting?: {
    executeScript(details: { target: { tabId: number }; files: string[] }): Promise<unknown>;
  };
}

const chromeApi = (globalThis as { chrome?: ChromeApi }).chrome;
const SETTINGS_KEY = 'atlas-export-options';
const CONTENT_SCRIPT_FILE = 'dist/apps/extension/src/content.js';

if (chromeApi?.commands) {
  chromeApi.commands.onCommand.addListener(async (command: string) => {
    if (command === 'copy-export') {
      await triggerInActiveTab('copy');
    }
    if (command === 'download-export') {
      await triggerInActiveTab('download');
    }
  });
}

if (chromeApi?.runtime?.onMessage) {
  chromeApi.runtime.onMessage.addListener(
    (msg: ExtensionMessage, _sender: unknown, sendResponse: (value: unknown) => void) => {
      if (msg.type === 'atlas:get-settings') {
        chromeApi.storage.local.get(SETTINGS_KEY).then((result: Record<string, unknown>) => {
          sendResponse(
            resolveExportOptions(
              (result[SETTINGS_KEY] as Partial<ExportOptions>) ?? DEFAULT_EXPORT_OPTIONS
            )
          );
        });
        return true;
      }

      if (msg.type === 'atlas:set-settings') {
        const options = resolveExportOptions(msg.options);
        chromeApi.storage.local
          .set({ [SETTINGS_KEY]: options })
          .then(() => sendResponse({ ok: true }));
        return true;
      }

      if (msg.type === 'atlas:action' && msg.action) {
        triggerInActiveTab(msg.action, msg.options)
          .then(() => sendResponse({ ok: true }))
          .catch((error) => sendResponse({ ok: false, error: normalizeRuntimeError(error) }));
        return true;
      }
    }
  );
}

async function triggerInActiveTab(
  action: ExtensionAction,
  options?: Partial<ExportOptions>
): Promise<void> {
  const api = chromeApi;
  if (!api) {
    throw new Error('Chrome runtime API is unavailable.');
  }

  const tabs = await api.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  if (!tab?.id) {
    throw new Error('No active tab found for export.');
  }

  const stored = await api.storage.local.get(SETTINGS_KEY);
  const merged = resolveExportOptions({
    ...(stored[SETTINGS_KEY] as Partial<ExportOptions> | undefined),
    ...(options ?? {})
  });

  await sendExportMessageWithInjectionFallback(api, tab.id, action, merged);
}

export async function sendExportMessageWithInjectionFallback(
  api: Pick<ChromeApi, 'tabs' | 'scripting'>,
  tabId: number,
  action: ExtensionAction,
  options: ExportOptions
): Promise<void> {
  try {
    const response = await api.tabs.sendMessage(tabId, {
      type: 'atlas:export',
      action,
      options
    });
    assertExportSucceeded(response);
    return;
  } catch (error) {
    if (!isNoReceiverError(error)) {
      throw error;
    }
  }

  if (!api.scripting?.executeScript) {
    throw new Error('No receiving content script found and chrome.scripting is unavailable.');
  }

  await api.scripting.executeScript({
    target: { tabId },
    files: [CONTENT_SCRIPT_FILE]
  });

  const response = await api.tabs.sendMessage(tabId, {
    type: 'atlas:export',
    action,
    options
  });
  assertExportSucceeded(response);
}

function isNoReceiverError(error: unknown): boolean {
  const message = String((error as { message?: unknown })?.message ?? error ?? '').toLowerCase();
  return (
    message.includes('receiving end does not exist') ||
    message.includes('could not establish connection')
  );
}

function assertExportSucceeded(response: ExportDispatchResponse | undefined): void {
  if (response?.ok === true) {
    return;
  }

  throw new Error(response?.error || 'Unknown page-context export failure.');
}

function normalizeRuntimeError(error: unknown): string {
  const raw = String((error as { message?: unknown })?.message ?? error ?? '').trim();
  const message = raw.replace(/^error:\s*/i, '');
  if (!message || /unknown error/i.test(message)) {
    return 'Unknown browser error while exporting. Reload the chat tab, then try again.';
  }
  return message;
}

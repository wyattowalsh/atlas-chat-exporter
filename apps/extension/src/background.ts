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
    ): Promise<void>;
  };
}

const chromeApi = (globalThis as { chrome?: ChromeApi }).chrome;
const SETTINGS_KEY = 'atlas-export-options';

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
          .catch((error) => sendResponse({ ok: false, error: String(error) }));
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
    return;
  }

  const tabs = await api.tabs.query({ active: true, currentWindow: true });
  const tab = tabs[0];
  if (!tab?.id) {
    return;
  }

  const stored = await api.storage.local.get(SETTINGS_KEY);
  const merged = resolveExportOptions({
    ...(stored[SETTINGS_KEY] as Partial<ExportOptions> | undefined),
    ...(options ?? {})
  });

  await api.tabs.sendMessage(tab.id, {
    type: 'atlas:export',
    action,
    options: merged
  });
}

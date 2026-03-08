export interface ExtensionMessage {
  type?: string;
  action?: 'copy' | 'download';
  options?: Record<string, unknown>;
}

export type MessageResponder = (value: unknown) => void;
export type MessageListener = (
  message: ExtensionMessage,
  sender: unknown,
  sendResponse: MessageResponder
) => boolean | void;

export interface ChromeApi {
  commands?: {
    onCommand: {
      addListener(listener: (command: string) => void | Promise<void>): void;
    };
  };
  runtime?: {
    onMessage?: {
      addListener(listener: MessageListener): void;
    };
    sendMessage(message: unknown): Promise<unknown>;
  };
  tabs: {
    query(queryInfo: { active: boolean; currentWindow: boolean }): Promise<Array<{ id?: number }>>;
    sendMessage(tabId: number, message: unknown): Promise<void>;
  };
  storage: {
    local: {
      get(key: string): Promise<Record<string, unknown>>;
      set(items: Record<string, unknown>): Promise<void>;
    };
  };
}

export function getChromeApi(): ChromeApi | undefined {
  const candidate = (globalThis as { chrome?: unknown }).chrome;
  return candidate as ChromeApi | undefined;
}

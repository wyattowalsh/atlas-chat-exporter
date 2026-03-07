export type AdapterAction = "copy" | "download" | "save" | "stdout" | "unknown";

export class AtlasChatExporterError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = new.target.name;
    this.code = code;
  }
}

export class NoTurnsFoundError extends AtlasChatExporterError {
  constructor(message = "No conversation turns were found in the current page context.") {
    super(message, "NO_TURNS_FOUND");
  }
}

export class AdapterError extends AtlasChatExporterError {
  readonly adapter: string;

  constructor(adapter: string, message: string, code = "ADAPTER_ERROR") {
    super(message, code);
    this.adapter = adapter;
  }
}

export class AdapterActionError extends AtlasChatExporterError {
  readonly adapter: string;
  readonly action: AdapterAction;

  constructor(adapter: string, action: AdapterAction, message: string, code = "ADAPTER_ACTION_ERROR") {
    super(message, code);
    this.adapter = adapter;
    this.action = action;
  }
}

export class ClipboardUnavailableError extends AdapterActionError {
  constructor(adapter: string, message = "Clipboard access is blocked or unavailable in this runtime.") {
    super(adapter, "copy", message, "CLIPBOARD_UNAVAILABLE");
  }
}

export class DownloadUnavailableError extends AdapterActionError {
  constructor(adapter: string, message = "File download is blocked or unavailable in this runtime.") {
    super(adapter, "download", message, "DOWNLOAD_UNAVAILABLE");
  }
}

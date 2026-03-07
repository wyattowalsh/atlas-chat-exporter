export type ExportErrorCode =
  | "NO_TURNS_FOUND"
  | "SELECTOR_DRIFT"
  | "COPY_BLOCKED"
  | "DOWNLOAD_BLOCKED";

export class ExporterError extends Error {
  public readonly code: ExportErrorCode;

  public constructor(code: ExportErrorCode, message: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
  }
}

export class NoTurnsFoundError extends ExporterError {
  public constructor(message = "No conversation turns were found in the current page.") {
    super("NO_TURNS_FOUND", message);
  }
}

export class SelectorDriftError extends ExporterError {
  public constructor(
    message =
      "Expected conversation selectors are no longer matching. Check for UI changes and update parser selectors.",
  ) {
    super("SELECTOR_DRIFT", message);
  }
}

export class CopyBlockedError extends ExporterError {
  public constructor(
    message =
      "Clipboard write access is blocked in this runtime. Use download or save-to-file output instead.",
  ) {
    super("COPY_BLOCKED", message);
  }
}

export class DownloadBlockedError extends ExporterError {
  public constructor(
    message =
      "Download was blocked in this runtime. Use copy-to-clipboard or save-to-file output instead.",
  ) {
    super("DOWNLOAD_BLOCKED", message);
  }
}

export function isExporterError(error: unknown): error is ExporterError {
  return error instanceof ExporterError;
}

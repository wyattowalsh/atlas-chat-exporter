export type SharedErrorCode =
  | "NO_TURNS_FOUND"
  | "SELECTOR_DRIFT"
  | "COPY_BLOCKED"
  | "DOWNLOAD_BLOCKED";

export class SharedError extends Error {
  public readonly code: SharedErrorCode;

  constructor(code: SharedErrorCode, message: string) {
    super(message);
    this.name = "SharedError";
    this.code = code;
  }
}

export class NoTurnsFoundError extends SharedError {
  constructor(message = "No conversation turns were found in the current page context.") {
    super("NO_TURNS_FOUND", message);
    this.name = "NoTurnsFoundError";
  }
}

export class SelectorDriftError extends SharedError {
  constructor(message = "Expected selectors no longer match the conversation structure.") {
    super("SELECTOR_DRIFT", message);
    this.name = "SelectorDriftError";
  }
}

export class CopyBlockedError extends SharedError {
  constructor(message = "Copy action is blocked by the runtime permissions or user settings.") {
    super("COPY_BLOCKED", message);
    this.name = "CopyBlockedError";
  }
}

export class DownloadBlockedError extends SharedError {
  constructor(message = "Download action is blocked by the runtime permissions or user settings.") {
    super("DOWNLOAD_BLOCKED", message);
    this.name = "DownloadBlockedError";
  }
}

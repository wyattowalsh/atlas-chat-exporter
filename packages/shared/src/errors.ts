export class ExportError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ExportError";
  }
}

export class NoTurnsFoundError extends ExportError {
  constructor() {
    super("No conversation turns found");
    this.name = "NoTurnsFoundError";
  }
}

export class ClipboardBlockedError extends ExportError {
  constructor() {
    super("Clipboard access blocked");
    this.name = "ClipboardBlockedError";
  }
}

export class DownloadBlockedError extends ExportError {
  constructor() {
    super("Download action blocked");
    this.name = "DownloadBlockedError";
  }
}

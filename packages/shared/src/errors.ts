export type ExporterErrorCode =
  | "NO_TURNS_FOUND"
  | "ACTION_BLOCKED"
  | "VALIDATION_FAILED";

export class ExporterError extends Error {
  readonly code: ExporterErrorCode;

  constructor(code: ExporterErrorCode, message: string) {
    super(message);
    this.name = "ExporterError";
    this.code = code;
  }
}

export class NoTurnsFoundError extends ExporterError {
  constructor(message = "No conversation turns were found in the current page") {
    super("NO_TURNS_FOUND", message);
    this.name = "NoTurnsFoundError";
  }
}

export class ActionBlockedError extends ExporterError {
  readonly action: "clipboard" | "download" | "save" | "stdout";

  constructor(
    action: "clipboard" | "download" | "save" | "stdout",
    message = `Action blocked: ${action}`,
  ) {
    super("ACTION_BLOCKED", message);
    this.name = "ActionBlockedError";
    this.action = action;
  }
}

export class ValidationError extends ExporterError {
  readonly path: string;

  constructor(path: string, message: string) {
    super("VALIDATION_FAILED", `${path}: ${message}`);
    this.name = "ValidationError";
    this.path = path;
  }
}

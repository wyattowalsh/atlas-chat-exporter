export class NoTurnsFoundError extends Error {
  constructor() {
    super("No conversation turns were discovered in the provided DOM fixture.");
    this.name = "NoTurnsFoundError";
  }
}

export class SelectorDriftError extends Error {
  constructor(version) {
    super(`Selector drift detected for selector version: ${version}.`);
    this.name = "SelectorDriftError";
  }
}

export class PartiallyLoadedDomError extends Error {
  constructor() {
    super("Conversation appears partially loaded; turn extraction is incomplete.");
    this.name = "PartiallyLoadedDomError";
  }
}

export class MalformedCitationError extends Error {
  constructor(citationText) {
    super(`Malformed citation token encountered: ${citationText}`);
    this.name = "MalformedCitationError";
  }
}

export class ClipboardBlockedError extends Error {
  constructor() {
    super("Clipboard access was blocked by the runtime.");
    this.name = "ClipboardBlockedError";
  }
}

export class DownloadBlockedError extends Error {
  constructor() {
    super("Download action was blocked by the runtime.");
    this.name = "DownloadBlockedError";
  }
}

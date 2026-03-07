import {
  NoTurnsFoundError,
  SelectorDriftError,
  PartiallyLoadedDomError,
} from "../../shared/src/errors.js";

const SUPPORTED_SELECTOR_VERSION = "v1";

export function parseConversationFixture(rawDomText) {
  const parsed = JSON.parse(rawDomText);

  if (parsed.meta?.selectorVersion && parsed.meta.selectorVersion !== SUPPORTED_SELECTOR_VERSION) {
    throw new SelectorDriftError(parsed.meta.selectorVersion);
  }

  if (parsed.meta?.partial === true) {
    throw new PartiallyLoadedDomError();
  }

  if (!Array.isArray(parsed.turns) || parsed.turns.length === 0) {
    throw new NoTurnsFoundError();
  }

  return {
    title: parsed.title,
    source: parsed.source ?? "unknown",
    exportedAt: "2024-01-01T00:00:00.000Z",
    turns: parsed.turns,
  };
}

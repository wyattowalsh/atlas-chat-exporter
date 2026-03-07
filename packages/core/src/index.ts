import { parseConversationHtml } from "../../parser-dom/src/index.js";
import { renderJson } from "../../render-json/src/index.js";
import { renderMarkdown } from "../../render-markdown/src/index.js";
import { collapseDuplicateTurns, cleanupBlocks } from "../../transform/src/index.js";
import type { ConversationDoc, ExportOptions } from "../../shared/src/index.js";
import { defaultExportOptions } from "../../shared/src/index.js";

export class NoTurnsFoundError extends Error {}

export function exportConversation(html: string, options: Partial<ExportOptions> = {}): { doc: ConversationDoc; output: string } {
  const resolved = { ...defaultExportOptions, ...options };
  const parsed = parseConversationHtml(html);

  if (!parsed.turns.length) {
    throw new NoTurnsFoundError("No conversation turns were found.");
  }

  const doc: ConversationDoc = {
    source: parsed.source,
    exportedAt: "2024-01-01T00:00:00.000Z",
    turns: collapseDuplicateTurns(
      parsed.turns.map((turn) => ({
        ...turn,
        blocks: cleanupBlocks(turn.blocks, resolved.citationMode, resolved.includeStatusUpdates)
      }))
    )
  };

  const output =
    resolved.outputFormat === "json"
      ? renderJson(doc)
      : renderMarkdown(doc, resolved.includeRoleHeadings, resolved.includeHorizontalRules);

  return { doc, output };
}

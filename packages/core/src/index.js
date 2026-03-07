import { discoverTurns } from '../../parser-dom/src/index.js';
import { renderJson } from '../../render-json/src/index.js';
import { renderMarkdown } from '../../render-markdown/src/index.js';
import { ExportError } from '../../shared/src/types.js';
import { applyTransforms } from '../../transform/src/index.js';

export const defaultOptions = {
  includeStatusUpdates: false,
  citationMode: 'normalize',
  includeRoleHeadings: true,
  includeHorizontalRules: false,
  normalizeLinks: true,
  outputFormat: 'markdown'
};

export function buildConversationDoc(html) {
  const turns = discoverTurns(html);
  if (!turns.length) throw new ExportError('No turns found in DOM', 'NO_TURNS_FOUND');
  return { source: 'chatgpt-atlas', exportedAt: new Date('2025-01-01T00:00:00.000Z').toISOString(), turns };
}

export function exportConversation(html, partial = {}) {
  const options = { ...defaultOptions, ...partial };
  const transformed = applyTransforms(buildConversationDoc(html), options.citationMode, options.includeStatusUpdates, options.normalizeLinks);
  return options.outputFormat === 'json' ? renderJson(transformed) : renderMarkdown(transformed, options.includeRoleHeadings, options.includeHorizontalRules);
}

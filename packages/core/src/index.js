/** @typedef {'user'|'assistant'|'system'|'unknown'} Role */
/** @typedef {'keep'|'normalize'|'strip'} CitationMode */
/** @typedef {'markdown'|'json'|'html'|'text'} OutputFormat */

/**
 * @typedef {Object} ExportOptions
 * @property {boolean} includeStatusUpdates
 * @property {CitationMode} citationMode
 * @property {boolean} includeRoleHeadings
 * @property {boolean} includeHorizontalRules
 * @property {boolean} normalizeLinks
 * @property {OutputFormat} outputFormat
 */

export const DEFAULT_OPTIONS = {
  includeStatusUpdates: true,
  citationMode: 'normalize',
  includeRoleHeadings: true,
  includeHorizontalRules: true,
  normalizeLinks: true,
  outputFormat: 'markdown'
};

function sanitizeText(text) {
  return text.replace(/\r\n/g, '\n').replace(/[ \t]+\n/g, '\n').trim();
}

export function extractConversationFromPage(documentLike, options = DEFAULT_OPTIONS) {
  const nodes = Array.from(documentLike.querySelectorAll('[data-message-author-role], article'));
  if (!nodes.length) {
    return {
      title: documentLike.title || 'Untitled chat',
      source: 'unknown',
      exportedAt: new Date().toISOString(),
      turns: []
    };
  }

  const turns = nodes
    .map((node) => {
      const role = /** @type {Role} */ (node.getAttribute?.('data-message-author-role') || inferRole(node));
      const text = sanitizeText(node.innerText || node.textContent || '');
      return text ? { role, blocks: [{ kind: 'paragraph', text }] } : null;
    })
    .filter(Boolean);

  return {
    title: documentLike.title || 'Untitled chat',
    source: 'chatgpt-web',
    exportedAt: new Date().toISOString(),
    turns
  };
}

function inferRole(node) {
  const cls = `${node.className || ''}`.toLowerCase();
  if (cls.includes('assistant')) return 'assistant';
  if (cls.includes('user')) return 'user';
  return 'unknown';
}

export function renderMarkdown(doc, options = DEFAULT_OPTIONS) {
  return doc.turns
    .map((turn, index) => {
      const header = options.includeRoleHeadings ? `### ${turn.role}\n\n` : '';
      const body = turn.blocks.map((b) => b.text || '').join('\n\n');
      const divider = options.includeHorizontalRules && index < doc.turns.length - 1 ? '\n\n---\n\n' : '';
      return `${header}${body}${divider}`;
    })
    .join('')
    .trim();
}

export function renderJson(doc) {
  return JSON.stringify(doc, null, 2);
}

export function exportConversation(documentLike, rawOptions = {}) {
  const options = { ...DEFAULT_OPTIONS, ...rawOptions };
  const doc = extractConversationFromPage(documentLike, options);

  if (options.outputFormat === 'json') {
    return { doc, content: renderJson(doc), mimeType: 'application/json', extension: 'json' };
  }

  return { doc, content: renderMarkdown(doc, options), mimeType: 'text/markdown', extension: 'md' };
}

export const EXIT_CODES = {
  OK: 0,
  NO_TURNS_FOUND: 20,
  CLIPBOARD_BLOCKED: 30,
  DOWNLOAD_BLOCKED: 40,
  BROWSER_TARGET_UNAVAILABLE: 50,
  UNEXPECTED: 1
};

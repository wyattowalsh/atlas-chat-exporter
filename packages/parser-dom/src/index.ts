import { SelectorDriftError } from '../../shared/src/index.js';
import type { Block, ConversationDoc, ListItem, Role, Turn } from '../../shared/src/index.js';

const TEXT_NODE = 3;
const ELEMENT_NODE = 1;

const STRICT_TURN_SELECTOR = '[data-message-author-role]';
const FALLBACK_TURN_SELECTOR = [
  "article[data-testid*='conversation-turn']",
  "[data-testid*='conversation-turn']",
  '.conversation-turn',
  "[data-role='user']",
  "[data-role='assistant']",
  "[data-role='system']"
].join(',');

const TURN_BODY_SELECTORS = [
  '[data-message-content]',
  '.markdown',
  "[class*='markdown']",
  '.prose'
];

const STRUCTURED_BLOCK_SELECTOR = 'h1,h2,h3,h4,h5,h6,p,pre,blockquote,ul,ol,table,hr';

const UI_NOISE_PATTERNS = [
  /^copy code$/i,
  /^edit message$/i,
  /^chatgpt said:?$/i,
  /^you said:?$/i,
  /^regenerate$/i
];

interface ParseContext {
  citationIndex: number;
}

export function parseConversationFromDom(
  root: Document | Element,
  exportedAt: string,
  source: ConversationDoc['source'],
  title?: string
): ConversationDoc {
  const turns = discoverTurns(root).map((node) => parseTurn(node));

  return {
    ...(title ? { title } : {}),
    source,
    exportedAt,
    turns: turns.filter((turn) => turn.blocks.length > 0)
  };
}

export function discoverTurns(root: Document | Element): Element[] {
  const strictMatches = Array.from(root.querySelectorAll(STRICT_TURN_SELECTOR));
  if (strictMatches.length > 0) {
    return dedupeByContainment(strictMatches);
  }

  const fallbackMatches = Array.from(root.querySelectorAll(FALLBACK_TURN_SELECTOR)).filter(
    (node) => !isLikelyConversationContainer(node)
  );
  if (fallbackMatches.length > 0) {
    return dedupeByContainment(fallbackMatches);
  }

  {
    const container = isDocumentNode(root) ? root.body : root;
    const hasConversationRoot =
      container.matches?.('[data-conversation-root], #conversation') ||
      Boolean(container.querySelector?.('[data-conversation-root], #conversation'));
    const hasAnyElements = (container.querySelectorAll?.('*').length ?? 0) > 0;

    if (hasConversationRoot && hasAnyElements) {
      throw new SelectorDriftError('Conversation root found but no turn selectors matched.');
    }

    return [container].filter(Boolean) as Element[];
  }
}

export function inferRole(turnNode: Element): Role {
  const attrRole = turnNode.getAttribute('data-message-author-role')?.toLowerCase();
  if (attrRole === 'user' || attrRole === 'assistant' || attrRole === 'system') {
    return attrRole;
  }

  const dataRole = turnNode.getAttribute('data-role')?.toLowerCase();
  if (dataRole === 'user' || dataRole === 'assistant' || dataRole === 'system') {
    return dataRole;
  }

  const classRole = turnNode.className.toLowerCase();
  if (classRole.includes('assistant')) {
    return 'assistant';
  }
  if (classRole.includes('user')) {
    return 'user';
  }
  if (classRole.includes('system')) {
    return 'system';
  }

  const labelText = firstText(turnNode, 80).toLowerCase();
  if (labelText.startsWith('you')) {
    return 'user';
  }
  if (labelText.startsWith('chatgpt') || labelText.startsWith('assistant')) {
    return 'assistant';
  }
  if (labelText.startsWith('system')) {
    return 'system';
  }

  return 'unknown';
}

export function parseTurn(turnNode: Element): Turn {
  const role = inferRole(turnNode);
  const context: ParseContext = { citationIndex: 1 };
  const turnBody = selectTurnBody(turnNode);

  const blockNodes = collectBlockNodes(turnBody);
  const blocks = blockNodes
    .map((node) => parseBlock(node, context))
    .filter((block): block is Block => Boolean(block));

  return { role, blocks };
}

function collectBlockNodes(bodyNode: Element): Element[] {
  const directChildren = Array.from(bodyNode.children).filter((node) => !isUiChromeNode(node));
  const directStructured = directChildren.filter((node) => node.matches(STRUCTURED_BLOCK_SELECTOR));
  if (directStructured.length > 0) {
    return directStructured;
  }

  const structuredDescendants = Array.from(
    bodyNode.querySelectorAll(STRUCTURED_BLOCK_SELECTOR)
  ).filter((node) => !isUiChromeNode(node));
  if (structuredDescendants.length > 0) {
    return structuredDescendants;
  }

  if (directChildren.length > 0) {
    return directChildren;
  }

  return isUiChromeNode(bodyNode) ? [] : [bodyNode];
}

function parseBlock(node: Element, context: ParseContext): Block | null {
  const tag = node.tagName.toLowerCase();

  if (isUiChromeNode(node)) {
    return null;
  }

  if (/^h[1-6]$/.test(tag)) {
    return {
      kind: 'heading',
      level: Number(tag[1]) as 1 | 2 | 3 | 4 | 5 | 6,
      text: cleanText(serializeInline(node, context))
    };
  }

  if (tag === 'p') {
    return { kind: 'paragraph', text: cleanText(serializeInline(node, context)) };
  }

  if (tag === 'pre') {
    const code = node.querySelector('code');
    const className = code?.className ?? '';
    const language = className.match(/language-([\w-]+)/)?.[1];
    return {
      kind: 'code',
      ...(language ? { language } : {}),
      code: (code?.textContent || node.textContent || '').trimEnd()
    };
  }

  if (tag === 'blockquote') {
    return { kind: 'blockquote', text: cleanText(serializeInline(node, context)) };
  }

  if (tag === 'ul' || tag === 'ol') {
    return { kind: 'list', ordered: tag === 'ol', items: parseListItems(node, context) };
  }

  if (tag === 'table') {
    const rows = Array.from(node.querySelectorAll('tr')).map((tr) =>
      Array.from(tr.querySelectorAll('th,td')).map((cell) =>
        cleanText(serializeInline(cell, context))
      )
    );
    return { kind: 'table', rows };
  }

  if (tag === 'hr') {
    return { kind: 'rule' };
  }

  const text = cleanText(serializeInline(node, context));
  return text ? { kind: 'raw', text } : null;
}

function parseListItems(list: Element, context: ParseContext): ListItem[] {
  return Array.from(list.children)
    .filter((child) => child.tagName.toLowerCase() === 'li')
    .map((li) => {
      const nestedList = Array.from(li.children).find((child) =>
        ['ul', 'ol'].includes(child.tagName.toLowerCase())
      );
      const clone = li.cloneNode(true) as Element;
      if (nestedList) {
        const nestedInClone = Array.from(clone.children).find((child) =>
          ['ul', 'ol'].includes(child.tagName.toLowerCase())
        );
        nestedInClone?.remove();
      }

      const item: ListItem = { text: cleanText(serializeInline(clone, context)) };
      if (nestedList) {
        item.children = parseListItems(nestedList, context);
      }

      return item;
    })
    .filter((item) => item.text.length > 0 || (item.children?.length ?? 0) > 0);
}

function serializeInline(node: Element, context: ParseContext): string {
  const pieces: string[] = [];

  for (const child of Array.from(node.childNodes)) {
    if (child.nodeType === TEXT_NODE) {
      pieces.push((child.textContent || '').replace(/\s+/g, ' '));
      continue;
    }

    if (child.nodeType !== ELEMENT_NODE) {
      continue;
    }

    const element = child as Element;
    if (isUiChromeNode(element)) {
      continue;
    }

    if (isCitationNode(element)) {
      pieces.push(serializeCitation(element, context));
      continue;
    }

    if (element.tagName.toLowerCase() === 'a') {
      const href = element.getAttribute('href') || '';
      const label = cleanText(element.textContent || href || 'link');
      pieces.push(href ? `[${label}](${href})` : label);
      continue;
    }

    pieces.push(serializeInline(element, context));
  }

  return pieces.join('');
}

function isCitationNode(node: Element): boolean {
  const testId = node.getAttribute('data-testid')?.toLowerCase() ?? '';
  const className = node.className.toLowerCase();
  const ariaLabel = node.getAttribute('aria-label')?.toLowerCase() ?? '';

  return (
    node.hasAttribute('data-citation') ||
    testId.includes('citation') ||
    className.includes('citation') ||
    ariaLabel.includes('citation') ||
    node.tagName.toLowerCase() === 'sup'
  );
}

function serializeCitation(node: Element, context: ParseContext): string {
  const label =
    cleanText(node.textContent || `citation ${context.citationIndex}`) ||
    `citation ${context.citationIndex}`;
  const href = node.getAttribute('href') || node.querySelector('a')?.getAttribute('href') || '';
  const serialized = `[[CITATION:${context.citationIndex}|${escapePipe(label)}|${escapePipe(href)}]]`;
  context.citationIndex += 1;
  return serialized;
}

function escapePipe(value: string): string {
  return value.replace(/\|/g, '%7C');
}

function isUiChromeNode(node: Element): boolean {
  const text = cleanText(node.textContent || '');
  if (UI_NOISE_PATTERNS.some((pattern) => pattern.test(text))) {
    return true;
  }

  const role = node.getAttribute('role')?.toLowerCase();
  const testId = node.getAttribute('data-testid')?.toLowerCase() ?? '';
  if (role === 'button' || testId.includes('copy') || testId.includes('toolbar')) {
    return true;
  }

  return false;
}

function cleanText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function firstText(node: Element, maxLength: number): string {
  return cleanText(node.textContent || '').slice(0, maxLength);
}

function selectTurnBody(turnNode: Element): Element {
  for (const selector of TURN_BODY_SELECTORS) {
    const match = turnNode.querySelector(selector);
    if (match) {
      return match;
    }
  }

  return turnNode;
}

function dedupeByContainment(nodes: Element[]): Element[] {
  const unique: Element[] = [];
  for (const node of nodes) {
    if (unique.some((existing) => existing.contains(node))) {
      continue;
    }

    for (let i = unique.length - 1; i >= 0; i -= 1) {
      if (node.contains(unique[i]!)) {
        unique.splice(i, 1);
      }
    }

    unique.push(node);
  }

  return unique;
}

function isLikelyConversationContainer(node: Element): boolean {
  if (node.matches(STRICT_TURN_SELECTOR)) {
    return false;
  }

  const testId = node.getAttribute('data-testid')?.toLowerCase() ?? '';
  const hasTurnTestId = testId.includes('conversation-turn');
  if (hasTurnTestId) {
    return false;
  }

  const nestedTurnCount = node.querySelectorAll(
    `${STRICT_TURN_SELECTOR}, ${FALLBACK_TURN_SELECTOR}`
  ).length;
  return nestedTurnCount > 1;
}

function isDocumentNode(value: Document | Element): value is Document {
  return (value as Document).nodeType === 9;
}

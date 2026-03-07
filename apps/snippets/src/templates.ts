import { defaultExportOptions } from "../../../packages/shared/src/types.js";

export function snippetRuntime(action: "copy" | "download"): string {
  const optionsLiteral = JSON.stringify(defaultExportOptions);
  return `(() => {
  const options = ${optionsLiteral};
  const clean = (v) => (v || '').replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
  const turns = [...document.querySelectorAll("article,[data-message-author-role],[role='article']")];
  const md = turns.map((turn) => {
    const role = turn.getAttribute('data-message-author-role') || 'unknown';
    const body = [...turn.querySelectorAll('p,pre,blockquote,li')].map((n) => {
      if (n.tagName === 'PRE') return '```\\n' + clean(n.textContent) + '\\n```';
      if (n.tagName === 'LI') return '- ' + clean(n.textContent);
      if (n.tagName === 'BLOCKQUOTE') return '> ' + clean(n.textContent);
      return clean(n.textContent);
    }).filter(Boolean).join('\\n\\n');
    return '## ' + role + '\\n\\n' + body;
  }).join('\\n\\n---\\n\\n');

  if (${JSON.stringify(action)} === 'copy') {
    navigator.clipboard.writeText(md);
    console.log('Atlas export copied');
    return;
  }

  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'chat-export.md';
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 300);
})();`;
}

export function inspectSelectorsSnippet(): string {
  return `(() => {
  const selectors = ["article", "[data-message-author-role]", "[role='article']", "main"];
  const report = selectors.map((selector) => ({ selector, count: document.querySelectorAll(selector).length }));
  console.table(report);
  return report;
})();`;
}

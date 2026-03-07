import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const coreImport = "import { exportConversation } from '../../../packages/core/src/index.js';";

const copySnippet = `${coreImport}\nconst result = exportConversation(document, { outputFormat: 'markdown' });\nawait navigator.clipboard.writeText(result.content);\nconsole.log('Copied chat export');\n`;
const downloadSnippet = `${coreImport}\nconst result = exportConversation(document, { outputFormat: 'markdown' });\nconst blob = new Blob([result.content], { type: result.mimeType });\nconst a = document.createElement('a');\na.href = URL.createObjectURL(blob);\na.download = 'chat-export.' + result.extension;\na.click();\n`;
const inspectSnippet = `${coreImport}\nconst nodes = [...document.querySelectorAll('[data-message-author-role], article')];\nconsole.table(nodes.map((n, i) => ({ index: i, role: n.getAttribute('data-message-author-role'), className: n.className })));\n`;

writeFileSync(resolve('apps/snippets/generated/copy-chat.js'), copySnippet);
writeFileSync(resolve('apps/snippets/generated/download-chat.js'), downloadSnippet);
writeFileSync(resolve('apps/snippets/generated/inspect-chat-selectors.js'), inspectSnippet);
console.log('Generated snippets.');

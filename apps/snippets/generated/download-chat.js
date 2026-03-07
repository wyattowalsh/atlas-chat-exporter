import { exportConversation } from '../../../packages/core/src/index.js';
const result = exportConversation(document, { outputFormat: 'markdown' });
const blob = new Blob([result.content], { type: result.mimeType });
const a = document.createElement('a');
a.href = URL.createObjectURL(blob);
a.download = 'chat-export.' + result.extension;
a.click();

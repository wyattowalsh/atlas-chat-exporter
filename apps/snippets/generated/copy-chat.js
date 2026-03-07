import { exportConversation } from '../../../packages/core/src/index.js';
const result = exportConversation(document, { outputFormat: 'markdown' });
await navigator.clipboard.writeText(result.content);
console.log('Copied chat export');

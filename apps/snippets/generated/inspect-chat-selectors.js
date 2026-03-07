import { exportConversation } from '../../../packages/core/src/index.js';
const nodes = [...document.querySelectorAll('[data-message-author-role], article')];
console.table(nodes.map((n, i) => ({ index: i, role: n.getAttribute('data-message-author-role'), className: n.className })));

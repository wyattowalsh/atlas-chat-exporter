import { exportConversation } from '../../../packages/core/src/index.js';

window.__atlasExportHook = (opts) => exportConversation(document, opts);

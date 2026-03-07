import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const coreSource = readFileSync(resolve('packages/core/src/index.js'), 'utf8').replace(/export\s+/g, '');

function createRuntime(action) {
  const actionCode = action === 'copy'
    ? "navigator.clipboard.writeText(result.content);"
    : "const b=new Blob([result.content],{type:result.mimeType});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='chat-export.'+result.extension;a.click();";

  return `(()=>{${coreSource}\nconst result=exportConversation(document,{outputFormat:'markdown'});${actionCode}})();`;
}

const copyRuntime = createRuntime('copy');
const downloadRuntime = createRuntime('download');

writeFileSync(resolve('apps/bookmarklets/generated/copy-chat.runtime.js'), copyRuntime);
writeFileSync(resolve('apps/bookmarklets/generated/download-chat.runtime.js'), downloadRuntime);
writeFileSync(resolve('apps/bookmarklets/generated/copy-chat.bookmarklet.txt'), `javascript:${encodeURIComponent(copyRuntime)}`);
writeFileSync(resolve('apps/bookmarklets/generated/download-chat.bookmarklet.txt'), `javascript:${encodeURIComponent(downloadRuntime)}`);
console.log('Generated bookmarklets from packages/core source.');

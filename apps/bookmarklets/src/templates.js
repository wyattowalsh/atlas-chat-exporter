export const bookmarkletTemplates = {
  copy: `(async()=>{const c=window.__ATLAS_CORE__;if(!c?.exportFromDocument)throw new Error("Atlas core not loaded");const r=c.exportFromDocument(document,{outputFormat:"markdown"},"chatgpt-atlas");await navigator.clipboard.writeText(r.output);})();`,
  download: `(()=>{const c=window.__ATLAS_CORE__;if(!c?.exportFromDocument)throw new Error("Atlas core not loaded");const r=c.exportFromDocument(document,{outputFormat:"markdown"},"chatgpt-atlas");const b=new Blob([r.output],{type:"text/markdown"});const u=URL.createObjectURL(b);const a=document.createElement("a");a.href=u;a.download="atlas-export.md";a.click();URL.revokeObjectURL(u);})();`
};

import { exportConversation } from '../../../packages/core/src/index.js';
import { resolveExportOptions, type ExportOptions } from '../../../packages/shared/src/index.js';

const STORAGE_KEY = 'atlas-userscript-options';

export function exportFromPage(options?: Partial<ExportOptions>) {
  return exportConversation({
    root: document,
    options: resolveExportOptions(options),
    context: {
      locationHref: globalThis.location?.href,
      documentTitle: document.title
    }
  });
}

export async function copyFromPage(options?: Partial<ExportOptions>): Promise<void> {
  const result = exportFromPage(options);
  await navigator.clipboard.writeText(result.content);
}

export function mountUserscriptPanel(): void {
  const button = document.createElement('button');
  button.textContent = 'Export chat';
  Object.assign(button.style, {
    position: 'fixed',
    right: '12px',
    bottom: '12px',
    zIndex: '9999',
    padding: '8px 10px'
  });

  button.addEventListener('click', async () => {
    const options = await readOptions();
    await copyFromPage(options);
    button.textContent = 'Copied!';
    setTimeout(() => {
      button.textContent = 'Export chat';
    }, 1200);
  });

  document.body.append(button);
}

async function readOptions(): Promise<Partial<ExportOptions>> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw) as Partial<ExportOptions>;
  } catch {
    return {};
  }
}

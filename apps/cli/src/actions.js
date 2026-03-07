import { ExportError } from '../../../packages/shared/src/types.js';

export async function copyExport(contents, clipboard) {
  try {
    await clipboard.writeText(contents);
  } catch {
    throw new ExportError('Clipboard write blocked', 'CLIPBOARD_BLOCKED');
  }
}

export async function downloadExport(filename, contents, sink) {
  try {
    await sink.save(filename, contents);
  } catch {
    throw new ExportError('Download blocked', 'DOWNLOAD_BLOCKED');
  }
}

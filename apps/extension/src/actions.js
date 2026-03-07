import { ClipboardBlockedError, DownloadBlockedError } from "../../../packages/shared/src/errors.js";

export async function copyExport(text, env) {
  try {
    await env.clipboard.writeText(text);
    return { ok: true };
  } catch {
    throw new ClipboardBlockedError();
  }
}

export function downloadExport(text, filename, env) {
  try {
    env.download(text, filename);
    return { ok: true };
  } catch {
    throw new DownloadBlockedError();
  }
}

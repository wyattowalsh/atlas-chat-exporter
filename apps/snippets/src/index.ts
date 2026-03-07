import { ClipboardBlockedError, DownloadBlockedError } from "../../../packages/shared/src/errors.ts";

export interface ClipboardLike {
  writeText(text: string): Promise<void>;
}

export interface DownloadLike {
  download(filename: string, content: string): Promise<void>;
}

export async function copyChat(markdown: string, clipboard: ClipboardLike): Promise<void> {
  try {
    await clipboard.writeText(markdown);
  } catch {
    throw new ClipboardBlockedError();
  }
}

export async function downloadChat(filename: string, markdown: string, downloader: DownloadLike): Promise<void> {
  try {
    await downloader.download(filename, markdown);
  } catch {
    throw new DownloadBlockedError();
  }
}

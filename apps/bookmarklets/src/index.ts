import { inspectChatSelectorsSnippet, snippetRuntime } from '../../snippets/src/index.js';

export function toBookmarklet(script: string): string {
  return `javascript:${encodeURIComponent(script)}`;
}

export function buildCopyBookmarklet(): string {
  return toBookmarklet(snippetRuntime('copy'));
}

export function buildDownloadBookmarklet(): string {
  return toBookmarklet(snippetRuntime('download'));
}

export function buildInspectBookmarklet(): string {
  return toBookmarklet(inspectChatSelectorsSnippet());
}

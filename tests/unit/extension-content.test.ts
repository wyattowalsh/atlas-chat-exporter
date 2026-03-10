import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { exportConversation } from '../../packages/core/src/index.js';
import {
  copyFromCurrentDocument,
  copyTextWithFallback,
  downloadFromCurrentDocument,
  triggerDownload
} from '../../apps/extension/src/content.js';

vi.mock('../../packages/core/src/index.js', () => ({
  exportConversation: vi.fn()
}));

type ExportConversationResult = ReturnType<typeof exportConversation>;

const mockedExportConversation = vi.mocked(exportConversation);

function mockExportResult(
  overrides: Partial<ExportConversationResult> = {}
): ExportConversationResult {
  return {
    format: 'markdown',
    content: 'exported markdown',
    mimeType: 'text/markdown',
    fileExtension: 'md',
    suggestedFilename: 'atlas-chat.md',
    conversation: {
      source: 'chatgpt-atlas',
      exportedAt: new Date('2026-03-10T00:00:00.000Z').toISOString(),
      turns: [{ role: 'assistant', blocks: [{ kind: 'paragraph', text: 'example' }] }]
    },
    ...overrides
  };
}

function installDom(url = 'https://chatgpt.com/c/test'): JSDOM {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', { url });
  vi.stubGlobal('window', dom.window as unknown as Window & typeof globalThis);
  vi.stubGlobal('document', dom.window.document);
  vi.stubGlobal('location', dom.window.location);
  vi.stubGlobal('navigator', dom.window.navigator);
  return dom;
}

function setClipboardWrite(writeText: (text: string) => Promise<void>): void {
  Object.defineProperty(globalThis.navigator, 'clipboard', {
    value: { writeText },
    configurable: true
  });
}

describe('extension content copy fallback', () => {
  beforeEach(() => {
    installDom();
    mockedExportConversation.mockReset();
    mockedExportConversation.mockReturnValue(mockExportResult());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('prefers the DevTools copy function when available', async () => {
    const copySpy = vi.fn();
    const clipboardSpy = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('copy', copySpy);
    setClipboardWrite(clipboardSpy);

    await copyFromCurrentDocument();

    expect(copySpy).toHaveBeenCalledOnce();
    expect(copySpy).toHaveBeenCalledWith('exported markdown');
    expect(clipboardSpy).not.toHaveBeenCalled();
  });

  it('falls back to navigator.clipboard when DevTools copy throws', async () => {
    const copySpy = vi.fn(() => {
      throw new Error('copy unavailable');
    });
    const clipboardSpy = vi.fn().mockResolvedValue(undefined);
    const execSpy = vi.fn().mockReturnValue(false);

    vi.stubGlobal('copy', copySpy);
    setClipboardWrite(clipboardSpy);
    Object.defineProperty(globalThis.document, 'execCommand', {
      value: execSpy,
      configurable: true
    });

    await copyFromCurrentDocument();

    expect(copySpy).toHaveBeenCalledOnce();
    expect(clipboardSpy).toHaveBeenCalledWith('exported markdown');
    expect(execSpy).not.toHaveBeenCalled();
  });

  it('falls back to execCommand when clipboard is blocked', async () => {
    const clipboardSpy = vi.fn().mockRejectedValue(new Error('clipboard blocked'));
    const execSpy = vi.fn().mockReturnValue(true);

    setClipboardWrite(clipboardSpy);
    Object.defineProperty(globalThis.document, 'execCommand', {
      value: execSpy,
      configurable: true
    });

    await copyTextWithFallback('manual export');

    expect(clipboardSpy).toHaveBeenCalledWith('manual export');
    expect(execSpy).toHaveBeenCalledWith('copy');
    expect(globalThis.document.querySelectorAll('textarea')).toHaveLength(0);
  });

  it('throws when every copy path fails', async () => {
    const clipboardSpy = vi.fn().mockRejectedValue(new Error('clipboard blocked'));
    const execSpy = vi.fn().mockReturnValue(false);

    setClipboardWrite(clipboardSpy);
    Object.defineProperty(globalThis.document, 'execCommand', {
      value: execSpy,
      configurable: true
    });

    await expect(copyTextWithFallback('manual export')).rejects.toThrow(/clipboard copy failed/i);
  });
});

describe('extension content download behavior', () => {
  beforeEach(() => {
    installDom();
    mockedExportConversation.mockReset();
    mockedExportConversation.mockReturnValue(mockExportResult());
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('appends and removes the anchor, then revokes object URL after delay', () => {
    vi.useFakeTimers();
    const createObjectURL = vi.fn().mockReturnValue('blob:atlas-export');
    const revokeObjectURL = vi.fn();
    const clickSpy = vi
      .spyOn(
        (globalThis.window as unknown as { HTMLAnchorElement: typeof HTMLAnchorElement })
          .HTMLAnchorElement.prototype,
        'click'
      )
      .mockImplementation(() => undefined);

    const originalUrl = globalThis.URL;
    Object.defineProperty(globalThis, 'URL', {
      value: {
        createObjectURL,
        revokeObjectURL
      },
      configurable: true
    });

    try {
      downloadFromCurrentDocument();

      expect(createObjectURL).toHaveBeenCalledOnce();
      expect(clickSpy).toHaveBeenCalledOnce();
      expect(globalThis.document.querySelectorAll('a')).toHaveLength(0);

      vi.advanceTimersByTime(2999);
      expect(revokeObjectURL).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:atlas-export');
    } finally {
      Object.defineProperty(globalThis, 'URL', {
        value: originalUrl,
        configurable: true
      });
    }
  });

  it('supports direct triggerDownload calls with custom file names', () => {
    vi.useFakeTimers();
    const createObjectURL = vi.fn().mockReturnValue('blob:custom-download');
    const revokeObjectURL = vi.fn();
    const clickSpy = vi
      .spyOn(
        (globalThis.window as unknown as { HTMLAnchorElement: typeof HTMLAnchorElement })
          .HTMLAnchorElement.prototype,
        'click'
      )
      .mockImplementation(() => undefined);

    const originalUrl = globalThis.URL;
    Object.defineProperty(globalThis, 'URL', {
      value: {
        createObjectURL,
        revokeObjectURL
      },
      configurable: true
    });

    try {
      triggerDownload('content', 'text/plain', 'custom.txt');
      expect(createObjectURL).toHaveBeenCalledOnce();
      expect(clickSpy).toHaveBeenCalledOnce();
      vi.advanceTimersByTime(3000);
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:custom-download');
    } finally {
      Object.defineProperty(globalThis, 'URL', {
        value: originalUrl,
        configurable: true
      });
    }
  });
});

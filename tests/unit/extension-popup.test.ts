import { JSDOM } from 'jsdom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type SendMessageMock = ReturnType<typeof vi.fn>;

let sendMessage: SendMessageMock;

function setupDom(): JSDOM {
  const dom = new JSDOM(
    `<!doctype html>
      <html>
        <body>
          <input id="includeRoleHeadings" type="checkbox" checked />
          <input id="includeHorizontalRules" type="checkbox" />
          <select id="citationMode">
            <option value="keep">Keep</option>
            <option value="normalize" selected>Normalize</option>
            <option value="strip">Strip</option>
          </select>
          <button id="copyButton">Copy</button>
          <button id="downloadButton">Download</button>
          <div id="status"></div>
        </body>
      </html>`,
    {
      url: 'https://example.test/popup'
    }
  );

  vi.stubGlobal('window', dom.window as unknown as Window & typeof globalThis);
  vi.stubGlobal('document', dom.window.document);
  return dom;
}

async function loadPopupModule(): Promise<void> {
  vi.resetModules();
  await import('../../apps/extension/src/popup.js');
}

describe('extension popup runtime UX', () => {
  beforeEach(() => {
    setupDom();
    sendMessage = vi.fn();
    vi.stubGlobal('chrome', {
      runtime: {
        sendMessage
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('shows an error and keeps popup open when action fails', async () => {
    const closeSpy = vi.spyOn(window, 'close').mockImplementation(() => undefined);
    sendMessage.mockResolvedValueOnce({}).mockResolvedValueOnce({
      ok: false,
      error: 'No active tab found for export.'
    });

    await loadPopupModule();
    await vi.waitFor(() =>
      expect(sendMessage).toHaveBeenCalledWith({ type: 'atlas:get-settings' })
    );

    const copyButton = document.getElementById('copyButton') as HTMLButtonElement;
    copyButton.click();

    await vi.waitFor(() => {
      const status = document.getElementById('status');
      expect(status?.textContent).toContain('No active tab found for export.');
      expect(status?.classList.contains('error')).toBe(true);
    });

    expect(closeSpy).not.toHaveBeenCalled();
    expect(copyButton.disabled).toBe(false);
  });

  it('closes popup when action succeeds', async () => {
    const closeSpy = vi.spyOn(window, 'close').mockImplementation(() => undefined);
    sendMessage.mockResolvedValueOnce({}).mockResolvedValueOnce({ ok: true });

    await loadPopupModule();
    await vi.waitFor(() =>
      expect(sendMessage).toHaveBeenCalledWith({ type: 'atlas:get-settings' })
    );

    const downloadButton = document.getElementById('downloadButton') as HTMLButtonElement;
    downloadButton.click();

    await vi.waitFor(() => expect(closeSpy).toHaveBeenCalledTimes(1));
  });
});

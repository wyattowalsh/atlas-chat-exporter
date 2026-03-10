import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_EXPORT_OPTIONS, resolveExportOptions } from '../../packages/shared/src/index.js';
import { sendExportMessageWithInjectionFallback } from '../../apps/extension/src/background.js';

const TEST_OPTIONS = resolveExportOptions(DEFAULT_EXPORT_OPTIONS);

describe('extension manifest coverage', () => {
  it('includes broad Atlas/OpenAI host coverage and scripting permission', () => {
    const manifestPath = resolve(process.cwd(), 'apps/extension/manifest.json');
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
      permissions?: string[];
      host_permissions?: string[];
      content_scripts?: Array<{ matches?: string[] }>;
    };

    expect(manifest.permissions).toContain('scripting');
    expect(manifest.host_permissions).toEqual(
      expect.arrayContaining(['https://chatgpt.com/*', 'https://*.openai.com/*'])
    );
    expect(manifest.content_scripts?.[0]?.matches).toEqual(
      expect.arrayContaining(['https://chatgpt.com/*', 'https://*.openai.com/*'])
    );
  });
});

describe('sendExportMessageWithInjectionFallback', () => {
  it('sends directly when a content script receiver exists', async () => {
    const sendMessage = vi.fn().mockResolvedValue(undefined);
    const executeScript = vi.fn().mockResolvedValue(undefined);

    await sendExportMessageWithInjectionFallback(
      {
        tabs: { query: vi.fn(), sendMessage },
        scripting: { executeScript }
      },
      123,
      'copy',
      TEST_OPTIONS
    );

    expect(sendMessage).toHaveBeenCalledTimes(1);
    expect(executeScript).not.toHaveBeenCalled();
  });

  it('injects content script and retries once when receiver is missing', async () => {
    const sendMessage = vi
      .fn()
      .mockRejectedValueOnce(
        new Error('Could not establish connection. Receiving end does not exist.')
      )
      .mockResolvedValue(undefined);
    const executeScript = vi.fn().mockResolvedValue(undefined);

    await sendExportMessageWithInjectionFallback(
      {
        tabs: { query: vi.fn(), sendMessage },
        scripting: { executeScript }
      },
      456,
      'download',
      TEST_OPTIONS
    );

    expect(executeScript).toHaveBeenCalledTimes(1);
    expect(executeScript).toHaveBeenCalledWith({
      target: { tabId: 456 },
      files: ['dist/apps/extension/src/content.js']
    });
    expect(sendMessage).toHaveBeenCalledTimes(2);
  });

  it('throws when receiver is missing and scripting API is unavailable', async () => {
    const sendMessage = vi
      .fn()
      .mockRejectedValue(
        new Error('Could not establish connection. Receiving end does not exist.')
      );

    await expect(
      sendExportMessageWithInjectionFallback(
        {
          tabs: { query: vi.fn(), sendMessage }
        },
        789,
        'copy',
        TEST_OPTIONS
      )
    ).rejects.toThrow(/scripting/i);
  });

  it('rethrows non-receiver dispatch errors', async () => {
    const sendMessage = vi.fn().mockRejectedValue(new Error('tab crashed'));
    const executeScript = vi.fn();

    await expect(
      sendExportMessageWithInjectionFallback(
        {
          tabs: { query: vi.fn(), sendMessage },
          scripting: { executeScript }
        },
        101,
        'copy',
        TEST_OPTIONS
      )
    ).rejects.toThrow('tab crashed');

    expect(executeScript).not.toHaveBeenCalled();
  });
});

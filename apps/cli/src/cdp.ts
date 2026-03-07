import CDP from "chrome-remote-interface";

export interface BrowserTargetOptions {
  host: string;
  port: number;
  target?: string;
}

export async function fetchOuterHtml(options: BrowserTargetOptions): Promise<string> {
  const client = await CDP({ host: options.host, port: options.port, target: options.target });
  try {
    const { Runtime, Page } = client;
    await Page.enable();
    await Runtime.enable();
    const result = await Runtime.evaluate({ expression: "document.documentElement.outerHTML" });
    return String(result.result.value ?? "");
  } finally {
    await client.close();
  }
}

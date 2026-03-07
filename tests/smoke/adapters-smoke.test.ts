import { describe, expect, it } from "vitest";

describe("adapter smoke", () => {
  it("imports adapter entry modules", async () => {
    const modules = await Promise.all([
      import("../../apps/cli/src/index.js"),
      import("../../apps/extension/src/index.js"),
      import("../../apps/snippets/src/index.js"),
      import("../../apps/userscript/src/index.js"),
      import("../../apps/bookmarklets/src/index.js"),
      import("../../apps/native-launchers/src/index.js")
    ]);

    for (const mod of modules) {
      expect(mod).toBeTypeOf("object");
    }
  });
});

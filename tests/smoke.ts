import { exportConversation } from "@atlas/core";

class FakeElement {
  public children: FakeElement[];
  public className = "";
  constructor(
    public readonly tagName: string,
    public textContent: string = "",
    children: FakeElement[] = [],
    private readonly attributes: Record<string, string> = {}
  ) {
    this.children = children;
  }

  getAttribute(name: string): string | null {
    return this.attributes[name] ?? null;
  }

  querySelector(_selector: string): FakeElement | null {
    return null;
  }

  querySelectorAll(_selector: string): FakeElement[] {
    return [];
  }
}

class FakeRoot {
  constructor(private readonly turns: FakeElement[]) {}

  querySelectorAll(_selector: string): FakeElement[] {
    return this.turns;
  }
}

const fakeRoot = new FakeRoot([
  new FakeElement(
    "article",
    "Hello",
    [new FakeElement("p", "Hello")],
    { "data-message-author-role": "user" }
  ),
  new FakeElement(
    "article",
    "Answer",
    [new FakeElement("p", "Answer")],
    { "data-message-author-role": "assistant" }
  )
]) as unknown as ParentNode;

exportConversation({ root: fakeRoot, options: { outputFormat: "markdown" } });

import { exportConversation } from "@atlas/core";
class FakeElement {
    tagName;
    textContent;
    attributes;
    children;
    className = "";
    constructor(tagName, textContent = "", children = [], attributes = {}) {
        this.tagName = tagName;
        this.textContent = textContent;
        this.attributes = attributes;
        this.children = children;
    }
    getAttribute(name) {
        return this.attributes[name] ?? null;
    }
    querySelector(_selector) {
        return null;
    }
    querySelectorAll(_selector) {
        return [];
    }
}
class FakeRoot {
    turns;
    constructor(turns) {
        this.turns = turns;
    }
    querySelectorAll(_selector) {
        return this.turns;
    }
}
const fakeRoot = new FakeRoot([
    new FakeElement("article", "Hello", [new FakeElement("p", "Hello")], { "data-message-author-role": "user" }),
    new FakeElement("article", "Answer", [new FakeElement("p", "Answer")], { "data-message-author-role": "assistant" })
]);
exportConversation({ root: fakeRoot, options: { outputFormat: "markdown" } });

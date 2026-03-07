(() => {
  const selectors = ["[data-message-author-role]", "[data-testid*='conversation-turn']", "article[data-role]"];
  const counts = selectors.map((s) => ({ selector: s, count: document.querySelectorAll(s).length }));
  console.table(counts);
})();

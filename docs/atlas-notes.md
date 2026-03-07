# Atlas Notes

Atlas-specific behavior and caveats that affect extraction reliability.

## Scope

This document captures differences between Atlas-hosted chat surfaces and Chromium-reference behavior.

## Known Atlas caveats

1. **Selector drift**
   - Atlas can alter class names/DOM wrappers without notice.
   - Parser should rely on robust structural cues over fragile class selectors.

2. **Citation chip rendering differences**
   - Citation chips may appear as nested buttons, anchors, or mixed inline controls.
   - `citationMode` transforms must avoid corrupting surrounding markdown.

3. **Lazy-loaded history**
   - Older turns might not be present in DOM until user scrolls.
   - Export UX should warn when partial history is likely.

4. **Interim status messages**
   - Atlas can inject transient status/progress messages in assistant turns.
   - `includeStatusUpdates` option should control whether these remain.

5. **Clipboard restrictions**
   - Some Atlas/enterprise contexts can block clipboard writes.
   - Download/file paths must remain available as fallback.

6. **Potential shadow DOM / containerization variance**
   - Some deployments may wrap chat regions differently.
   - Snippet inspection utility should assist rapid selector diagnosis.

## Validation stance

- Validate parser correctness with fixtures and Chromium-reference tests.
- Run periodic Atlas manual smoke tests and document failures.
- If Atlas deviates unexpectedly, document caveats rather than silently changing shared semantics.

## Recommended manual checks for Atlas

- Export simple chat (markdown/json).
- Export citation-heavy chat in `keep`, `normalize`, and `strip` modes.
- Export code-heavy chat and verify language fences.
- Verify behavior with partially loaded history.
- Confirm clipboard failure falls back to download.

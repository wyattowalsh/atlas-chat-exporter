# Atlas Notes

This document tracks Atlas-specific runtime caveats and validation guidance.

## Scope

- Atlas is the motivating environment for this project.
- Chrome/Chromium behavior is used as the implementation reference when Atlas behavior diverges.

## Atlas caveats

1. **Selector volatility**
   - Atlas UI structure may change frequently.
   - Turn/container selectors can drift faster than in reference Chrome paths.

2. **Citation chip variability**
   - Citation markup may differ between Atlas sessions and standard ChatGPT web views.
   - Normalization rules must be robust to multiple chip structures.

3. **Partial/lazy rendering**
   - Older turns can be collapsed, virtualized, or not fully present in DOM until scrolled.
   - Exports should surface actionable warnings when content appears incomplete.

4. **Clipboard context instability**
   - Clipboard write operations can fail depending on focus/gesture policies.
   - Download/file fallback should always be available.

5. **Interim status text differences**
   - Atlas may render short status updates with differing labels.
   - Removal must remain option-controlled (`includeStatusUpdates`) and deterministic.

## Validation stance

- Validate parser behavior against Chromium baseline first.
- Re-run smoke/manual checks on Atlas.
- Record all Atlas-only issues as explicit caveats rather than hidden edge behavior.

## Atlas validation checklist (manual)

For each adapter intended to support Atlas:

1. Open a conversation with mixed content (headings, list, code, links, table, citations).
2. Run export in `markdown` format with `citationMode=keep`.
3. Confirm role boundaries and block structure are preserved.
4. Re-run with `citationMode=normalize` and verify citation readability.
5. Re-run with `citationMode=strip` and confirm prose remains coherent.
6. Toggle `includeStatusUpdates` both ways and verify expected differences.
7. Validate fallback behavior if clipboard is denied/blocked.
8. Validate behavior after forcing lazy-loaded older turns to load.

## Issue recording guidance

When filing Atlas-specific issues, include:

- Atlas environment/version (if available)
- Adapter used
- Options used
- Reproduction steps
- Raw snippet of problematic DOM (sanitized)
- Expected vs actual markdown/json output
- Whether behavior reproduces in Chromium reference flow

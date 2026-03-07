# Atlas Notes

This document tracks Atlas-specific behavior, caveats, and validation expectations.

## Status

- Atlas adapters are not yet implemented in this repository.
- Notes below define expected caveat handling once implementation begins.

## Atlas-specific caveats to track

1. **Selector drift risk**
   - Atlas DOM attributes/class names may change more frequently than expected.
   - Parser should rely on robust structural cues with fallback strategies.

2. **Conversation loading variance**
   - Atlas may lazy-load historical turns.
   - Manual and automated tests should include partially loaded DOM fixtures.

3. **Citation UI representation variance**
   - Citation chips may render as buttons, anchors, superscripts, or mixed wrappers.
   - `citationMode` behavior must stay stable regardless of representation.

4. **Clipboard restrictions by context**
   - Copy actions may fail based on iframe/security context.
   - Download/save pathways should remain available.

5. **Interim assistant status text differences**
   - Atlas may present brief status/progress strings that should be optional in output.
   - Keep configurable via `includeStatusUpdates`.

## Validation policy

- Use Chrome/Chromium as reference runtime for initial implementation validation.
- Validate Atlas behavior explicitly where available.
- Document unsupported or flaky behavior instead of silently degrading.

## Known limitations (current)

Because adapter code is not yet scaffolded:

- No validated selector map exists.
- No Atlas runtime smoke test is present.
- No measured compatibility matrix is available yet.

## Recommended implementation notes

- Keep Atlas-specific selector hooks in adapter layer, not in shared transform/render logic.
- Add fixture snapshots capturing Atlas-like citation and list/table structures.
- Track regressions with small, reproducible DOM fixtures.

## Future tracking template

Use this template for each newly observed Atlas issue:

```text
Issue ID:
Date observed:
Runtime/version:
Symptom:
Likely cause:
Affected adapters:
Workaround:
Fix status:
Fixture/test added:
```

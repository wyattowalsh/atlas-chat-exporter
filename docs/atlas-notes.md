# Atlas notes

Working notes on Atlas-specific runtime behavior, caveats, and validation guidance.

## Scope

- Atlas is the motivating target.
- Chromium ChatGPT web behavior remains the reference for baseline correctness.
- Any Atlas divergence should be documented here and reflected in manual test steps.

## Known Atlas caveats

1. **Selector drift risk**
   - Atlas DOM markers may change across cohorts/releases.
   - Mitigation: layered selectors and fallback discovery logic.

2. **Partial/lazy rendering variance**
   - Atlas may render turns incrementally and delay structured nodes.
   - Mitigation: robust traversal and fallback block parsing strategy.

3. **Clipboard restrictions in embedded contexts**
   - Some Atlas frames/origins can block copy flows.
   - Mitigation: always provide download/file fallback actions.

4. **Citation chip shape variance**
   - Citation nodes may differ from stable web ChatGPT markup.
   - Mitigation: parser captures citation intent; transform handles keep/normalize/strip deterministically.

5. **Interim status message formatting variance**
   - Assistant progress snippets can appear with inconsistent wrappers.
   - Mitigation: configurable status stripping transform with conservative defaults.

## Validation strategy

- Validate core behavior in Chrome/Chromium reference pages first.
- Re-run adapter manual tests in Atlas environments and record deviations.
- Do not silently special-case Atlas in adapters where shared-parser updates are needed.

## Reporting format for new caveats

When discovering Atlas-specific behavior, record:

- date/time and Atlas build context (if available)
- affected adapter(s)
- minimal reproduction and fixture candidate
- observed vs expected output
- proposed parser/transform fix location

# Option Matrix

This document defines canonical export options and expected adapter support.

## Canonical options

| Option | Type | Default (recommended) | Description |
|---|---|---|---|
| `includeStatusUpdates` | boolean | `false` | Keep or remove low-value interim assistant status updates. |
| `citationMode` | `keep \| normalize \| strip` | `normalize` | Citation handling mode. |
| `includeRoleHeadings` | boolean | `true` | Include role section labels in rendered output. |
| `includeHorizontalRules` | boolean | `true` | Separate turns with horizontal rules in markdown/text outputs. |
| `normalizeLinks` | boolean | `true` | Normalize links/URLs for stable rendering. |
| `outputFormat` | `markdown \| json \| html \| text` | `markdown` | Output target format (minimum required: markdown + json). |
| `filenameTemplate` | string (optional) | `chat-export-{timestamp}` | File naming template where file output is used. |

## Citation mode semantics

### `keep`

- Preserve citations as faithfully as practical.
- Keep source anchors/labels where recoverable.
- Must not break markdown structure.

### `normalize`

- Convert noisy citation chips into cleaner link/label forms.
- Preserve meaning while improving readability.

### `strip`

- Remove citation markers while preserving surrounding sentence flow.
- Avoid punctuation corruption or merged words.

## Adapter support expectations

| Adapter | Reads options | Required output formats | Required actions | Notes |
|---|---|---|---|---|
| Extension | Yes | markdown, json | copy, download | Persist settings locally. |
| DevTools snippets | Yes | markdown, json | copy, download | Include selector inspection snippet. |
| OS macros | Indirect (via snippet) | snippet-dependent | snippet-dependent | Wrapper only. |
| Bookmarklets | Yes | markdown, json | download (required), copy (optional) | Keep payload compact. |
| Userscript | Yes | markdown, json | copy, download | Minimal UI, local persistence only. |
| CLI/CDP | Yes | markdown, json | stdout, file (required), copy/download (optional) | Stable exit codes required. |
| Native launcher | Via CLI | markdown, json | launcher-defined | Must delegate to CLI/core. |

## Format requirements

### Required now

- `markdown`
- `json`

### Optional/later

- `html`
- `text`

Optional formats must not destabilize required formats.

## Backward-compatibility guidance

- Prefer additive option changes.
- Avoid changing defaults without explicit decision-log entry.
- If option semantics change, update:
  - `README.md`
  - this file
  - tests/fixtures
  - release checklist

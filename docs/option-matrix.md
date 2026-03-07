# Option Matrix

This document defines export options and expected cross-adapter behavior.

## Status

- Option model is documented as a contract.
- Runtime plumbing is not yet implemented.

## Canonical options

| Option | Type | Default (target) | Description |
|---|---|---:|---|
| `includeStatusUpdates` | boolean | `false` | Include or strip interim assistant status/progress turns. |
| `citationMode` | `keep \| normalize \| strip` | `normalize` | Control citation serialization. |
| `includeRoleHeadings` | boolean | `true` | Render role boundaries/labels in Markdown output. |
| `includeHorizontalRules` | boolean | `true` | Insert separators between turns in Markdown output. |
| `normalizeLinks` | boolean | `true` | Normalize URL formatting where safe. |
| `outputFormat` | `markdown \| json \| html \| text` | `markdown` | Select renderer format. |
| `filenameTemplate` | string? | adapter-defined | Naming template for downloads/files. |

## Citation mode behavior

| Mode | Behavior | Requirement |
|---|---|---|
| `keep` | Preserve citations as faithfully as practical. | Must not break Markdown structure. |
| `normalize` | Convert chips/wrappers into cleaner labels/links. | Deterministic conversion rules only. |
| `strip` | Remove citation markers while preserving prose flow. | Must avoid deleting surrounding non-citation text. |

## Output format support by adapter (target)

| Adapter | Markdown | JSON | HTML (optional) | Text (optional) |
|---|---:|---:|---:|---:|
| Extension | ✅ | ✅ | ◻️ | ◻️ |
| Snippets | ✅ | ✅ | ◻️ | ◻️ |
| Bookmarklets | ✅ | ✅ | ◻️ | ◻️ |
| Userscript | ✅ | ✅ | ◻️ | ◻️ |
| CLI | ✅ | ✅ | ◻️ | ◻️ |
| Native launchers | via CLI | via CLI | via CLI (optional) | via CLI (optional) |

Legend: ✅ required target support, ◻️ optional/later.

## Action support by adapter (target)

| Adapter | Copy | Download | Save to disk | Stdout |
|---|---:|---:|---:|---:|
| Extension | ✅ | ✅ | n/a | n/a |
| Snippets | ✅ | ✅ | n/a | n/a |
| Bookmarklets | ⚠️ best-effort | ✅ preferred | n/a | n/a |
| Userscript | ✅ | ✅ | n/a | n/a |
| CLI | optional | optional | ✅ | ✅ |
| Native launchers | via CLI | via CLI | via CLI | via CLI |

## Failure behavior expectations

- If copy fails: return actionable error and keep download/save path available.
- If download fails: return actionable error and keep copy/stdout path available where possible.
- If no turns found: return explicit parse error (not empty success).
- If selectors drift: surface adapter/runtime hint in error details.

## Backward-compatibility guidance

- New options should be additive where possible.
- Defaults should remain stable unless strong migration reason exists.
- Any breaking option behavior should be logged in `docs/decision-log.md`.

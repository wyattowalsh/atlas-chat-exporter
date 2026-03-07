# Option matrix

Compatibility matrix for export options and delivery actions across adapters.

## Export options

| Option | Description | Extension | Snippets | Macros | Bookmarklet | Userscript | CLI/CDP | Native launcher |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| `includeStatusUpdates` | Keep/remove low-value interim assistant updates | ✅ | ✅ | ✅* | ✅ | ✅ | ✅ | ✅* |
| `citationMode=keep` | Preserve citation material as captured | ✅ | ✅ | ✅* | ✅ | ✅ | ✅ | ✅* |
| `citationMode=normalize` | Normalize citation chips into cleaner form | ✅ | ✅ | ✅* | ✅ | ✅ | ✅ | ✅* |
| `citationMode=strip` | Remove citations while keeping prose | ✅ | ✅ | ✅* | ✅ | ✅ | ✅ | ✅* |
| `includeRoleHeadings` | Add role headings in markdown output | ✅ | ✅ | ✅* | ✅ | ✅ | ✅ | ✅* |
| `includeHorizontalRules` | Delimit turns with horizontal rules | ✅ | ✅ | ✅* | ✅ | ✅ | ✅ | ✅* |
| `normalizeLinks` | Normalize URL/link formatting | ✅ | ✅ | ✅* | ✅ | ✅ | ✅ | ✅* |
| `outputFormat=markdown` | Markdown renderer | ✅ | ✅ | ✅* | ✅ | ✅ | ✅ | ✅* |
| `outputFormat=json` | JSON renderer | ✅ | ✅ | ✅* | ✅ | ✅ | ✅ | ✅* |

`*` Macros and native launchers delegate to snippets/CLI respectively; support depends on underlying target.

## Export actions

| Action | Extension | Snippets | Macros | Bookmarklet | Userscript | CLI/CDP | Native launcher |
|---|---:|---:|---:|---:|---:|---:|---:|
| Copy to clipboard | ✅ | ✅ | ✅ | ⚠️ (browser-dependent) | ✅ | ✅ (where available) | ✅ (delegated) |
| Download file | ✅ | ✅ | ✅ | ✅ (preferred) | ✅ | ✅ | ✅ (delegated) |
| Save to disk path | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ (delegated) |
| Emit to stdout | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ (delegated) |

## Adapter permission rationale

### Extension (MV3)

- `activeTab` / `scripting`: run extraction in current tab context.
- `storage`: persist user settings locally.
- `downloads`: write exported files.
- optional clipboard permission: support copy action where required.

### Snippets and bookmarklets

- Execute in active page context.
- No persistent background permissions.

### Userscript

- Page access granted by userscript manager on matching domains.
- Optional manager APIs for clipboard and download utilities.

### CLI / CDP

- Debugging attachment to browser target (local).
- Local filesystem access for output files.
- No remote upload behavior by default.

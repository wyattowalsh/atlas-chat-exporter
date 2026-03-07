# Option Matrix

Supported options/actions by adapter surface. Keep synchronized with implementation.

## Export options

| Option | Description | Extension | Snippets | Bookmarklet | Userscript | CLI/CDP | Native launcher |
|---|---|---:|---:|---:|---:|---:|---:|
| `outputFormat=markdown` | Markdown rendering | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (via CLI) |
| `outputFormat=json` | JSON rendering | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ (via CLI) |
| `citationMode=keep` | Preserve citation output | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `citationMode=normalize` | Normalize citation chips | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `citationMode=strip` | Remove citation chips | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `includeStatusUpdates` | Keep/remove interim assistant status blocks | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `includeRoleHeadings` | Add role headings in output | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `includeHorizontalRules` | Separator between turns | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `normalizeLinks` | Canonicalize URL formatting | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| `filenameTemplate` | Output filename pattern | ✅ | ⚠️ | ⚠️ | ✅ | ✅ | ✅ |

## Delivery actions

| Action | Extension | Snippets | Bookmarklet | Userscript | CLI/CDP | Native launcher |
|---|---:|---:|---:|---:|---:|---:|
| Copy to clipboard | ✅ | ✅ | ⚠️ (runtime-dependent) | ✅ | ⚠️ (platform-dependent) | ⚠️ (delegates CLI) |
| Download file | ✅ | ✅ | ✅ (primary) | ✅ | ⚠️ (browser-context only) | ⚠️ (delegates CLI) |
| Save to disk path | ⚠️ (download-managed) | ❌ | ❌ | ❌ | ✅ | ✅ |
| Emit to stdout | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ (via CLI passthrough) |

## Adapter permission rationale

| Adapter | Permissions / capabilities | Why needed |
|---|---|---|
| Extension (MV3) | `activeTab`, `scripting`, `downloads`, `storage`, optional `clipboardWrite` | DOM read, script injection, file export, local settings, copy action |
| Snippets | DevTools execution context, page DOM, clipboard/download API | In-page extraction and user-triggered export |
| Bookmarklets | Current page DOM + browser download/copy capability | Minimal installation export surface |
| Userscript | Page DOM + GM/browser APIs (optional storage/menu) | Persistent lightweight in-page controls |
| CLI/CDP | Chrome remote debugging connection + local filesystem/stdout | Scriptable automation and local output routing |
| Native launcher | Ability to invoke CLI binary with args | OS-integrated trigger without parser duplication |

## Notes

- ⚠️ means feasible but environment/runtime-dependent.
- Unsupported capabilities should degrade with clear user-facing error messages.

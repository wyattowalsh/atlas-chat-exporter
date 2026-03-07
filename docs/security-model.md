# Security Model

## Privacy posture

`atlas-chat-exporter` is local-first by default.

### Explicit defaults

- No telemetry
- No analytics
- No silent uploads
- No background sync
- No remote persistence unless explicitly added, opt-in, and documented

## Data classification

Exports may contain sensitive data, including:

- Personal information
- Proprietary business information
- Credentials accidentally pasted into chats
- Legal/medical/financial discussions

Treat all conversation content as sensitive by default.

## Trust boundaries

1. **Host page boundary**: Chat content originates in browser DOM.
2. **Adapter boundary**: Adapter accesses page and invokes shared core.
3. **Local output boundary**: Result is copied/downloaded/saved/stdout locally.
4. **No network boundary**: No outbound transmission by default architecture.

## Data flow (intended)

```text
Chat DOM
  -> shared parser/transform/renderer (local process/runtime)
  -> local output action (clipboard/download/file/stdout)
```

No step should require remote services.

## Adapter permission rationale

### Chromium extension (Manifest V3)

Typical permission needs (minimize aggressively):

- `activeTab` or scoped host permissions: required to read current chat DOM.
- `scripting`: inject/run adapter entrypoint on active tab.
- `storage`: persist local user options.
- `downloads` (if download action implemented): save export files locally.
- `clipboardWrite` (optional, if direct copy action implemented): copy exported result.

**Rationale**

These permissions enable local extraction and user-requested local output actions only.

### DevTools snippets

- Runs in user-initiated DevTools context.
- Uses page/DevTools execution context to read DOM and run shared logic.
- No additional extension-level persistent permissions by default.

### OS-level macros

- Macro tools may need accessibility/automation permissions to trigger browser actions.
- Macro must only trigger named snippet flow, not collect or transmit data itself.

### Bookmarklets

- Executes only when user triggers bookmarklet.
- Uses page context permissions already granted by browser model.
- Prefer download action due to clipboard variability.

### Userscript

- Requires match patterns for supported chat pages.
- Optional storage APIs for local settings.
- Optional clipboard/download permissions depending on manager/runtime APIs.

### CLI / CDP injector

- Requires local access to browser debugging endpoint/session.
- File system permissions limited to user-selected output paths.
- Must not send exported content to remote endpoints.

### Native launcher

- Inherits permissions of launcher shell/app.
- Must delegate to local CLI and maintain local-only data flow.

## Security controls and expectations

1. **Least privilege**: request minimal permissions per adapter.
2. **Explicit user actions**: export actions should be user-triggered.
3. **Deterministic behavior**: avoid hidden behavior that manipulates content unexpectedly.
4. **Transparent errors**: if an action fails (clipboard/download), return clear user-actionable messages.
5. **No hidden network calls**: keep runtime and dependencies free of telemetry/network exfil paths.

## Non-goals (current)

- Cloud sync
- Team sharing backend
- Server-side parsing pipeline
- Analytics dashboards

These are out of scope unless explicitly added through a design + security review.

## Security review checklist for changes

When introducing new adapter features or dependencies:

1. Does this introduce new data access beyond current tab/session?
2. Does this introduce new permissions?
3. Does this introduce any outbound network behavior?
4. Is new local storage introduced? If yes, what is stored and where?
5. Are failure paths safe and visible to users?
6. Are docs updated (`README`, `security-model`, `release-checklist`)?

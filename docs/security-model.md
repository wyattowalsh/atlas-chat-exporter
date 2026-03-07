# Security Model

## Security posture

The project is local-first by default and treats conversation exports as sensitive data.

## Local-first guarantees / no telemetry

- No telemetry, analytics, tracking, or remote logging in baseline implementation.
- No automatic uploads or background sync of exported content.
- Export payload remains local to browser/process memory and user-selected local outputs.
- Any future networked feature must be explicit opt-in with updated documentation and review.

## Data flow model

1. Read conversation content from active page DOM.
2. Parse/transform/render locally.
3. Route output to clipboard/download/file/stdout based on user action.

No remote service is required for extraction or rendering.

## Trust boundaries

- **Browser page context:** source data and runtime APIs.
- **Extension/script runtime:** extraction orchestration and adapter glue.
- **Local machine output targets:** clipboard and filesystem.
- **No trusted remote boundary** in baseline architecture.

## Adapter permission rationale

### Extension (MV3)
- `activeTab`/host access: needed to read current tab conversation nodes.
- `scripting`: needed to execute shared extraction entrypoint.
- `downloads`: needed for file export flow.
- `storage`: needed for local settings persistence.
- Optional `clipboardWrite`: needed for direct copy action.

### Snippets/bookmarklets/userscripts
- Need page-context DOM access.
- Rely on browser user-gesture and runtime capabilities for clipboard/download.

### CLI/CDP
- Requires local browser debugging interface attachment to evaluate extraction code.
- Writes outputs to local stdout/filesystem.

## Threat considerations

- Sensitive transcript disclosure through accidental logs.
- Over-broad permissions in extension manifest.
- Malicious script injection through build/runtime dependency compromise.
- User confusion around partial exports from lazy-loaded DOM.

## Mitigations

- Keep adapters thin and deterministic; isolate parsing in shared packages.
- Minimize requested permissions and document every permission purpose.
- Avoid network calls in export pipeline.
- Add fixture tests and smoke tests for parsing edge cases.
- Provide explicit warnings for partial-load detection and blocked clipboard states.

## Known Atlas caveats impacting security/usability

- Clipboard restrictions in enterprise contexts can fail copy flow.
- DOM drift can produce incomplete extraction if selectors age.
- Lazy loading can omit prior turns unless user hydrates history.

## Extension zip/crx prerequisites and key handling

- Zip artifacts can be generated from built extension output.
- CRX requires private key signing; key must be stored securely (local keychain/CI secret store).
- Never commit signing keys or print private key contents in CI logs.
- Restrict who can trigger signed artifact generation.

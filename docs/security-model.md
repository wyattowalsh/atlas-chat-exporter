# Security model

## Security posture

`atlas-chat-exporter` is local-first and privacy-preserving by default.

### Guarantees

- No telemetry or analytics collection by default.
- No automatic remote persistence or background syncing.
- No silent exfiltration of conversation content.
- User-initiated export actions only (copy/download/file/stdout).

## Data flow

1. User triggers export action.
2. Adapter reads in-page DOM/context locally.
3. Shared core parses/transforms/renders locally.
4. Result is delivered to user-selected local destination.

No external network destination is part of the default architecture.

## Adapter permission rationale

### Extension (Manifest V3)

- `activeTab` / `scripting`: inject extraction logic into current page when user asks.
- `storage`: save non-sensitive user preferences locally.
- `downloads`: save exports to local files.
- optional clipboard permission: support copy action where browser requires explicit permission.

Principles:

- least privilege
- explicit user action before extraction
- no background content harvesting

### Snippets / Bookmarklets

- Execute in user-opened page context only.
- No persistent permissions beyond page execution context.

### Userscript

- Permissions are constrained to matching chat domains.
- Optional clipboard/download helpers from userscript manager are used only for explicit actions.

### CLI / CDP

- Requires local browser debug attachment permission.
- Requires local filesystem permission for writing outputs.
- No network upload endpoints are part of default CLI behavior.

### Native launcher

- Delegates to CLI and inherits CLI permission boundaries.

## Threat model highlights

### In scope

- accidental data leakage via unintended network calls
- over-broad adapter permissions
- malformed output causing data corruption/loss
- misleading security claims in docs

### Out of scope (for now)

- endpoint compromise of user machine/browser
- malicious browser extensions unrelated to this project
- remote collaboration services (not currently part of architecture)

## Security controls

- shared-core architecture reduces duplicated sensitive logic.
- deterministic transforms enable fixture-based review.
- documented permission rationale per adapter.
- release checklist enforces packaging/signing/provenance review.

## Future changes policy

Any future feature that introduces remote connectivity must include:

- explicit opt-in UX
- clear data classification and retention policy
- security model update
- release-note disclosure

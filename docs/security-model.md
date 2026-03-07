# Security Model

## Purpose

This document describes privacy posture, trust boundaries, and security expectations for `atlas-chat-exporter`.

## Status

- Security model is defined.
- Adapter implementations are not yet present; this model is a binding design contract.

## Data classification

Potential exported content may include:

- user prompts
- assistant responses
- code snippets
- links/citations
- potentially sensitive proprietary or personal information

Treat all conversation content as sensitive by default.

## Security principles

1. Local-first processing.
2. No telemetry by default.
3. No silent network transmission.
4. Least privilege per adapter.
5. Explicit user-triggered actions for copy/download/save.

## Trust boundaries

### Browser page context

- Raw conversation DOM is read in the user browser context.
- Parsing should run locally and remain in memory unless user chooses export action.

### Local runtime context (CLI/native launcher)

- Data may be emitted to stdout or written to local files only when requested.
- No background persistence beyond explicit output files/config.

### No remote backend (default)

- There is no server-side processing requirement.
- Any future remote feature must be opt-in and separately documented.

## Permission expectations by adapter

### Extension (planned)

- Needs active tab/page access for extraction.
- Optional clipboard/write-download permissions for user-triggered exports.
- Must document every permission in user-facing docs.

### Snippets / bookmarklets / userscript (planned)

- Execute in-page with same-origin constraints.
- Should avoid broad storage usage beyond local settings.

### CLI / CDP injector (planned)

- Needs local browser debugging attachment permission.
- Should scope target selection explicitly to avoid accidental scraping of unrelated pages.

## Storage policy

Allowed by default:

- transient in-memory processing
- explicit exported files
- local preference settings

Not allowed by default:

- remote sync
- analytics event pipelines
- hidden local archival of conversation contents

## Threat model highlights

1. **Accidental over-capture**
   - Risk: parser captures UI chrome or unrelated DOM.
   - Mitigation: strict turn discovery + fixture tests.

2. **Clipboard leakage**
   - Risk: copied data exposed to other apps.
   - Mitigation: clear UX action boundaries and fallback to file export.

3. **Permission overreach**
   - Risk: extension/userscript requesting unnecessary access.
   - Mitigation: least privilege review at release time.

4. **Incorrect privacy claims**
   - Risk: docs overstate guarantees.
   - Mitigation: release checklist requires claim verification.

## Security validation checklist (implementation phase)

- Confirm no network calls in default export path.
- Confirm no telemetry packages/dependencies introduced.
- Confirm permissions match minimal required adapter capabilities.
- Confirm failure handling does not leak content to logs unexpectedly.
- Confirm docs accurately describe current behavior.

## Incident response guidance

If a privacy/security issue is found:

1. Reproduce with minimal fixture.
2. Assess data exposure scope.
3. Patch shared core/adapter with tests.
4. Update this security model and decision log.
5. Include release note documenting user impact and mitigation.

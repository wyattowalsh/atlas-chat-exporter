# Security model

## Goals

atlas-chat-exporter is designed as a **local-first exporter** for sensitive conversation data.

Security priorities:

1. Keep conversation content on-device by default.
2. Avoid hidden data flows (telemetry, analytics, remote persistence).
3. Make any network usage explicit, minimal, and reviewable.
4. Enforce security expectations through static policy checks in-repo.

## Threat model

### Protected assets

- Conversation body content and metadata.
- User prompts and assistant responses.
- Exported files (markdown/json).
- Local adapter configuration (extension/userscript/CLI options).

### Adversaries considered

- Malicious or accidental addition of telemetry/analytics SDKs.
- Regressions that introduce outbound HTTP/WebSocket calls in adapters.
- Over-broad extension/userscript permissions that expand blast radius.
- Supply-chain drift through dependency changes.

### Out of scope (current repository state)

- Hardening against a fully compromised host OS or browser runtime.
- Protection against malicious browser extensions unrelated to this project.
- Enterprise key-management workflows (not yet introduced).

## Trust boundaries

The core boundary is between:

1. **Local extraction pipeline** (`packages/*`, adapter runtime glue): trusted to process DOM and produce exports locally.
2. **Browser/runtime APIs** (clipboard, download, filesystem/stdout): trusted only for user-invoked export delivery.
3. **Network boundary**: denied by default for adapters. Any allowed path must be documented and policy-checked.

### Allowed network surfaces

Allowed network usage is policy-defined in `security/network-allowlist.json`.

Current policy:

- **Adapters default**: no outbound network (`allowNetwork: false`).
- **CLI exception**: local browser debugging attachment only (localhost / loopback for CDP over `ws`/`http`).
- **Remote hosts**: not allowed by default.

Implementation point: `security/network-allowlist.json` is loaded by `scripts/enforce-security-policy.mjs`, which validates adapter source for forbidden endpoint references and network call primitives.【F:security/network-allowlist.json†L1-L37】【F:scripts/enforce-security-policy.mjs†L1-L183】

## Telemetry and analytics prohibition

Telemetry/analytics libraries are denied by policy.

Implementation points:

- `security/forbidden-dependencies.json` contains blocked dependency names (Segment, Amplitude, PostHog, Sentry browser/node, Datadog RUM/CI, Firebase analytics, etc.).【F:security/forbidden-dependencies.json†L1-L17】
- `scripts/enforce-security-policy.mjs` scans all `package.json` manifests and fails on forbidden dependencies.【F:scripts/enforce-security-policy.mjs†L73-L111】
- `package.json` exposes `check:security-policy` so this check is easy to run locally and in CI.【F:package.json†L1-L9】

## Forbidden outbound endpoint checks in adapters

Adapter directories are statically scanned:

- `apps/extension`
- `apps/userscript`
- `apps/bookmarklets`
- `apps/snippets`
- `apps/cli`

The check flags:

1. Network primitives in adapter source (`fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `sendBeacon`).
2. Hardcoded `http(s)` endpoint literals that are not loopback-allowed.
3. Endpoint literals matching known telemetry/analytics domains/patterns.

Implementation point: adapter checks are implemented in `scripts/enforce-security-policy.mjs` via `FORBIDDEN_NET_CALL_PATTERNS`, `URL_PATTERN`, and `forbiddenEndpointPatterns` matching.【F:scripts/enforce-security-policy.mjs†L9-L23】【F:scripts/enforce-security-policy.mjs†L114-L160】

## Extension and userscript permission minimization

When extension/userscript adapters are added, they must follow least-privilege defaults.

### Extension (Manifest V3) policy

Required minimization rules:

- Use the smallest `host_permissions` scope possible.
- Prefer `activeTab` and explicit user action over broad always-on host access.
- Request only required permissions for export actions (`downloads`, `clipboardWrite` when truly needed).
- Avoid background polling and avoid permission combinations that imply passive data collection.

Rationale:

- Limits accidental access to unrelated pages.
- Reduces impact if adapter code is compromised.
- Aligns with local-first/no-telemetry commitments.

### Userscript policy

Required minimization rules:

- Restrict `@match` to explicit ChatGPT/Atlas URLs actually supported.
- Avoid broad wildcard domains where possible.
- Avoid `GM_xmlhttpRequest` unless a documented local-only exception exists.
- Keep data persistence local and explicit.

Rationale:

- Prevents script execution on unrelated pages.
- Avoids backdoor network surfaces through userscript-specific APIs.

## “What is never transmitted” guarantees

The following is a normative guarantee for current architecture and policy:

- Conversation content is never transmitted to third-party analytics/telemetry services.
- Export payloads are never uploaded by default.
- Adapter runtime code must not issue arbitrary outbound HTTP/WebSocket requests.
- Any future network-enabled feature must be explicitly allowlisted and documented before release.

Implementation tie-ins:

- Dependency denylist enforcement prevents common telemetry SDK introduction.【F:security/forbidden-dependencies.json†L1-L17】【F:scripts/enforce-security-policy.mjs†L73-L111】
- Adapter endpoint/static network checks prevent silent outbound endpoints and known analytics hosts.【F:security/network-allowlist.json†L1-L37】【F:scripts/enforce-security-policy.mjs†L114-L160】
- Project-level runnable check is available via `npm run check:security-policy`.【F:package.json†L1-L9】

## Verification workflow

Run on every change touching adapters, dependency manifests, or security docs:

```bash
npm run check:security-policy
```

Expected result:

- Pass with `Security policy checks passed.`
- Fail with concrete violation lines for dependencies/endpoints/patterns to fix before merge.

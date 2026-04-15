# ADR-001: Source-First Certification and Source-Isolated Reimplementation

- Status: accepted
- Date: 2026-04-15
- Taxonomy: `abstraction`
- Affected IDs:
  - `implementation.opencode_source`
  - `profile.core_runtime`
  - `profile.runtime_formal`
  - `profile.tui_certified`
  - `profile.integrations_canonical`
  - `profile.security_critical`
  - `profile.full_reference`

## Context

The repository is intended to support source-isolated downstream
reimplementation, but the baseline authority still comes from the original
`opencode` implementation. The plan requires the source implementation to be
the first certified consumer so the ghost contract cannot silently drift away
from the system it was extracted from.

## Decision

Treat `opencode` itself as the first certified implementation for promoted
profiles, and use the term `source-isolated reimplementation` for downstream
consumers rather than making a separate clean-room provenance claim.

## Rejected Alternatives

- Treat downstream Rust consumers as the first meaningful certification target.
- Use “clean-room” terminology in the normative contract.

## Impact

- Every promoted profile must remain source-first.
- Downstream Rust and Go consumers are adjudicated against the same ghost
  artifacts, but they do not supersede baseline source certification.

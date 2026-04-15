# ADR-003: Aggregate Profile Certification Summaries

- Status: accepted
- Date: 2026-04-15
- Taxonomy: `formalization-boundary`
- Affected IDs:
  - `artifact.script.profile_certify`
  - `artifact.evidence.profile_core_runtime`
  - `artifact.evidence.profile_runtime_formal`
  - `artifact.evidence.profile.tui_certified`
  - `artifact.evidence.profile.integrations_canonical`
  - `artifact.evidence.profile.security_critical`
  - `artifact.evidence.profile.full_reference`

## Context

Case-level transcripts are necessary but insufficient for profile adjudication.
Without aggregate profile summaries, the graph and completeness views understate
implemented closure and make profile certification harder to reason about.

## Decision

Generate deterministic profile-certification summaries from case-level
transcripts and treat those summaries as the canonical profile-closure
artifacts.

## Rejected Alternatives

- Infer profile closure only indirectly from raw transcript filenames.
- Require humans to maintain profile status by hand.

## Impact

- Profile certification becomes explicit, deterministic, and reviewable.
- `full-reference` can be summarized as an aggregate of promoted subprofiles.

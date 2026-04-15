# ADR-004: Normalization Boundary for Current Witness Families

- Status: accepted
- Date: 2026-04-15
- Taxonomy: `normalization`
- Affected IDs:
  - `artifact.script.normalize`
  - `claim.normalization.runtime_laws`
  - `claim.normalization.tui_laws`
  - `contracts/tui/normalization.md`

## Context

Normalization is a release-bearing semantic mechanism in the ghost repo, but the
currently promoted runtime and TUI witness families are already expressed as
stable projections that do not require additional quotienting.

## Decision

Retain identity normalization for the current promoted witness families while
keeping the normalization law checker and adversarial fixtures in place.

## Rejected Alternatives

- Introduce extra normalization into the certified runtime/TUI witness families
  before a concrete counterexample requires it.
- Treat normalization as an informal implementation detail.

## Impact

- The repo preserves semantically relevant distinctions in the current witness
  families.
- Any future non-identity normalization must be justified by new evidence or
  counterexamples.

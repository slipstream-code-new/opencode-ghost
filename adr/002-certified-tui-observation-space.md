# ADR-002: Certified TUI Observation Space

- Status: accepted
- Date: 2026-04-15
- Taxonomy: `observation-space`
- Affected IDs:
  - `surface.tui`
  - `profile.tui_certified`
  - `artifact.evidence.tui_permission_view_commuting`
  - `artifact.evidence.tui_session_list_dialog_commuting`
  - `artifact.evidence.tui_command_dialog_commuting`
  - `artifact.evidence.tui_theme_dialog_commuting`
  - `artifact.evidence.tui_plugin_route_missing_commuting`

## Context

The TUI contract separates interaction, layout, and frame semantics, but the
current certified witness family is still represented as a JSON projection over
screen IDs, layer sets, and the certified terminal matrix.

## Decision

Use `certified_tui_projection` with `exact_json` equivalence and identity
normalization for the current certified witness family. Exact frame parity is a
distinguished observation over the certified matrix, while broader TUI meaning
remains observational and layered.

## Rejected Alternatives

- Normalize away certified-screen distinctions.
- Collapse TUI conformance into a single renderer-specific snapshot format.

## Impact

- TUI commuting evidence remains mechanically comparable.
- Additional certified surfaces can be added without changing the observation
  algebra so long as they fit the same projection family.

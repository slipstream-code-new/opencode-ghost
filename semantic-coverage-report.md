# semantic-coverage-report.md

> Generated from `graph/contract-graph.jsonl`. Do not edit directly.

## Coverage Summary

| Dimension | Count |
| --- | --- |
| surfaces | 5 |
| profiles | 6 |
| claims | 30 |
| commuting_claims | 7 |
| source_certified_claims | 9 |
| requires_edges | 21 |
| checked_by_edges | 22 |
| certifies_edges | 10 |

## Surface Coverage

| Surface | Profiles | Claims |
| --- | --- | --- |
| `surface.runtime` | 3 | 0 |
| `surface.tui` | 2 | 5 |
| `surface.integrations` | 1 | 0 |
| `surface.security` | 1 | 0 |
| `surface.kernel` | 1 | 7 |

## Claim Coverage

| Claim | Kind | Checked by | State |
| --- | --- | --- | --- |
| `claim.source_first_certification` | `operational` | 0 | `provisional` |
| `claim.stable_ids` | `operational` | 0 | `provisional` |
| `claim.generated_governance` | `operational` | 0 | `provisional` |
| `claim.runtime.pending_waiting` | `operational` | 0 | `provisional` |
| `claim.runtime.approved_idle` | `operational` | 0 | `provisional` |
| `claim.runtime.rejected_idle` | `operational` | 0 | `provisional` |
| `claim.runtime.witness_final` | `operational` | 0 | `provisional` |
| `claim.runtime.reject_witness_final` | `operational` | 0 | `provisional` |
| `claim.runtime.commuting.permission_cycle` | `operational` | 1 | `provisional` |
| `claim.runtime.source_certified.permission_cycle` | `operational` | 1 | `provisional` |
| `claim.runtime.commuting.permission_reject` | `operational` | 1 | `provisional` |
| `claim.runtime.source_certified.permission_reject` | `operational` | 1 | `provisional` |
| `claim.tui.commuting.permission_view` | `operational` | 1 | `provisional` |
| `claim.tui.source_certified.permission_view` | `operational` | 1 | `provisional` |
| `claim.tui.commuting.session_list_dialog` | `operational` | 1 | `provisional` |
| `claim.tui.source_certified.session_list_dialog` | `operational` | 1 | `provisional` |
| `claim.tui.commuting.command_dialog` | `operational` | 1 | `provisional` |
| `claim.tui.source_certified.command_dialog` | `operational` | 1 | `provisional` |
| `claim.tui.commuting.theme_dialog` | `operational` | 1 | `provisional` |
| `claim.tui.source_certified.theme_dialog` | `operational` | 1 | `provisional` |
| `claim.tui.commuting.plugin_route_missing` | `operational` | 1 | `provisional` |
| `claim.tui.source_certified.plugin_route_missing` | `operational` | 1 | `provisional` |
| `claim.normalization.runtime_laws` | `operational` | 1 | `provisional` |
| `claim.normalization.tui_laws` | `operational` | 1 | `provisional` |
| `claim.integrations.providers_commuting` | `operational` | 1 | `provisional` |
| `claim.integrations.source_certified.providers` | `operational` | 1 | `provisional` |
| `claim.security.permission_gating_commuting` | `operational` | 1 | `provisional` |
| `claim.security.source_certified.permission_gating` | `operational` | 1 | `provisional` |
| `claim.rust_reference.runtime_tui` | `operational` | 1 | `provisional` |
| `claim.go_sanity.runtime_tui` | `operational` | 1 | `provisional` |

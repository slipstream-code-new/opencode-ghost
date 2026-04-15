# semantic-coverage-report.md

> Generated from `graph/contract-graph.jsonl`. Do not edit directly.

## Coverage Summary

| Dimension | Count |
| --- | --- |
| surfaces | 5 |
| profiles | 6 |
| claims | 16 |
| commuting_claims | 2 |
| source_certified_claims | 4 |
| requires_edges | 11 |
| checked_by_edges | 10 |
| certifies_edges | 5 |

## Surface Coverage

| Surface | Profiles | Claims |
| --- | --- | --- |
| `surface.runtime` | 3 | 0 |
| `surface.tui` | 2 | 1 |
| `surface.integrations` | 1 | 0 |
| `surface.security` | 1 | 0 |
| `surface.kernel` | 1 | 4 |

## Claim Coverage

| Claim | Kind | Checked by | State |
| --- | --- | --- | --- |
| `claim.source_first_certification` | `operational` | 0 | `provisional` |
| `claim.stable_ids` | `operational` | 0 | `provisional` |
| `claim.generated_governance` | `operational` | 0 | `provisional` |
| `claim.runtime.pending_waiting` | `operational` | 0 | `provisional` |
| `claim.runtime.approved_idle` | `operational` | 0 | `provisional` |
| `claim.runtime.witness_final` | `operational` | 0 | `provisional` |
| `claim.runtime.commuting.permission_cycle` | `operational` | 1 | `provisional` |
| `claim.runtime.source_certified.permission_cycle` | `operational` | 1 | `provisional` |
| `claim.tui.commuting.permission_view` | `operational` | 1 | `provisional` |
| `claim.tui.source_certified.permission_view` | `operational` | 1 | `provisional` |
| `claim.normalization.runtime_laws` | `operational` | 1 | `provisional` |
| `claim.normalization.tui_laws` | `operational` | 1 | `provisional` |
| `claim.integrations.providers_commuting` | `operational` | 1 | `provisional` |
| `claim.integrations.source_certified.providers` | `operational` | 1 | `provisional` |
| `claim.security.permission_gating_commuting` | `operational` | 1 | `provisional` |
| `claim.security.source_certified.permission_gating` | `operational` | 1 | `provisional` |

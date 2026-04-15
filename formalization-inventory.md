# formalization-inventory.md

> Generated from `graph/contract-graph.jsonl`. Do not edit directly.

| Entity | Relation | Target | State | Note |
| --- | --- | --- | --- | --- |
| `repo.opencode_ghost` | `contains` | `surface.kernel` | `provisional` | Canonical ghost-spec repository for source-isolated reimplementation. |
| `profile.runtime_formal` | `covers` | `surface.kernel` | `draft` | Formal kernel obligations over runtime semantics, including Quint and Lean artifacts. |
| `profile.runtime_formal` | `requires` | `artifact.spec.runtime_witness` | `draft` | Formal kernel obligations over runtime semantics, including Quint and Lean artifacts. |
| `profile.runtime_formal` | `requires` | `artifact.lean.runtime_witness` | `draft` | Formal kernel obligations over runtime semantics, including Quint and Lean artifacts. |
| `profile.runtime_formal` | `requires` | `artifact.case.runtime_permission_cycle` | `draft` | Formal kernel obligations over runtime semantics, including Quint and Lean artifacts. |
| `profile.runtime_formal` | `requires` | `artifact.evidence.runtime_permission_cycle_commuting` | `draft` | Formal kernel obligations over runtime semantics, including Quint and Lean artifacts. |
| `claim.runtime.pending_waiting` | `proved_by` | `artifact.lean.runtime_witness` | `provisional` | The runtime witness preserves the invariant that pending permission state and waiting permission phase coincide. |
| `claim.runtime.approved_idle` | `proved_by` | `artifact.lean.runtime_witness` | `provisional` | The runtime witness preserves the invariant that approved permission replies return the session to idle. |
| `claim.runtime.witness_final` | `specified_by` | `artifact.spec.runtime_witness` | `provisional` | The canonical create -> busy -> ask -> approve witness converges on the approved idle kernel state. |
| `claim.runtime.witness_final` | `refines` | `surface.kernel` | `provisional` | The canonical create -> busy -> ask -> approve witness converges on the approved idle kernel state. |
| `claim.runtime.pending_waiting` | `refines` | `surface.kernel` | `provisional` | The runtime witness preserves the invariant that pending permission state and waiting permission phase coincide. |
| `claim.runtime.approved_idle` | `refines` | `surface.kernel` | `provisional` | The runtime witness preserves the invariant that approved permission replies return the session to idle. |
| `claim.runtime.commuting.permission_cycle` | `refines` | `surface.kernel` | `provisional` | The canonical permission-cycle case projects to the same kernel observation across witness steps, runtime case expectations, and formal witness markers. |

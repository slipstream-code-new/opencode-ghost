# claims-ledger.md

> Generated from `graph/contract-graph.jsonl`. Do not edit directly.

| ID | Title | State | Class | Note |
| --- | --- | --- | --- | --- |
| `claim.source_first_certification` | source-first certification | `provisional` | `normative` | No promoted artifact becomes normative until opencode itself satisfies the relevant profile under the conformance kit. |
| `claim.stable_ids` | stable IDs are mandatory | `provisional` | `normative` | Every materially relevant entity receives a permanent graph ID that is never recycled. |
| `claim.generated_governance` | governance views are generated | `provisional` | `normative` | Ledgers, matrices, and reports are generated from the graph and are not independently authoritative. |
| `claim.runtime.pending_waiting` | pending permission implies waiting phase | `provisional` | `normative` | The runtime witness preserves the invariant that pending permission state and waiting permission phase coincide. |
| `claim.runtime.approved_idle` | approved permission implies idle phase | `provisional` | `normative` | The runtime witness preserves the invariant that approved permission replies return the session to idle. |
| `claim.runtime.witness_final` | permission witness replay reaches approved idle state | `provisional` | `normative` | The canonical create -> busy -> ask -> approve witness converges on the approved idle kernel state. |
| `claim.runtime.commuting.permission_cycle` | permission witness projection commutes | `provisional` | `normative` | The canonical permission-cycle case projects to the same kernel observation across witness steps, runtime case expectations, and formal witness markers. |
| `claim.runtime.source_certified.permission_cycle` | opencode source is certified for the permission witness slice | `provisional` | `normative` | The original opencode source tree satisfies the runtime-formal witness slice under the conformance-kit protocol transcript. |
| `claim.tui.commuting.permission_view` | TUI permission-view projection commutes | `provisional` | `normative` | The canonical TUI witness projects to the same certified screen and matrix observation across the witness definition, certified contract, and extracted inventories. |
| `claim.tui.source_certified.permission_view` | opencode source is certified for the TUI permission-view slice | `provisional` | `normative` | The original opencode source tree satisfies the TUI-certified witness slice under the conformance-kit protocol transcript. |
| `claim.normalization.runtime_laws` | runtime normalization laws hold | `provisional` | `normative` | Runtime normalization satisfies determinism, idempotence, monotonic erasure, and semantic preservation on adversarial fixtures. |
| `claim.normalization.tui_laws` | TUI normalization laws hold | `provisional` | `normative` | TUI normalization satisfies determinism, idempotence, monotonic erasure, and semantic preservation on adversarial fixtures. |

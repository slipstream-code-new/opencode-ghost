# rust-ergonomics-report.md

> Generated from `graph/contract-graph.jsonl`. Do not edit directly.

## Seed Rust-facing obligations

- `artifact.policy.classification`: Every tracked artifact is normative, informative, or generated.
- `artifact.policy.promotion`: Every normative candidate advances through draft, provisional, normative, or deprecated.
- `claim.source_first_certification`: No promoted artifact becomes normative until opencode itself satisfies the relevant profile under the conformance kit.
- `claim.stable_ids`: Every materially relevant entity receives a permanent graph ID that is never recycled.
- `claim.generated_governance`: Ledgers, matrices, and reports are generated from the graph and are not independently authoritative.
- `claim.runtime.pending_waiting`: The runtime witness preserves the invariant that pending permission state and waiting permission phase coincide.
- `claim.runtime.approved_idle`: The runtime witness preserves the invariant that approved permission replies return the session to idle.
- `claim.runtime.witness_final`: The canonical create -> busy -> ask -> approve witness converges on the approved idle kernel state.
- `claim.runtime.commuting.permission_cycle`: The canonical permission-cycle case projects to the same kernel observation across witness steps, runtime case expectations, and formal witness markers.
- `claim.runtime.source_certified.permission_cycle`: The original opencode source tree satisfies the runtime-formal witness slice under the conformance-kit protocol transcript.

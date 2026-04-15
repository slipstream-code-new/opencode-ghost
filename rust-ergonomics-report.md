# rust-ergonomics-report.md

> Generated from `graph/contract-graph.jsonl`. Do not edit directly.

## Seed Rust-facing obligations

- `artifact.policy.classification`: Every tracked artifact is normative, informative, or generated.
- `artifact.policy.promotion`: Every normative candidate advances through draft, provisional, normative, or deprecated.
- `claim.source_first_certification`: No promoted artifact becomes normative until opencode itself satisfies the relevant profile under the conformance kit.
- `claim.stable_ids`: Every materially relevant entity receives a permanent graph ID that is never recycled.
- `claim.generated_governance`: Ledgers, matrices, and reports are generated from the graph and are not independently authoritative.

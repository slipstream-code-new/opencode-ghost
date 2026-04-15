# rust-ergonomics-report.md

> Generated from `graph/contract-graph.jsonl`. Do not edit directly.

## Envelope Properties

| Property | Value |
| --- | --- |
| conformance_discriminant | `kind` |
| conformance_variants | 9 |
| verdict_status_values | pass, fail, unsupported, error |
| runtime_common_fields | kind, case_id, seq |
| checkpoint_common_fields | kind, case_id, seq, observation_kind, payload |
| deterministic_mode_required | true |

## Ordering Rules

- hello precedes all other messages
- capabilities must be stable within a session
- checkpoint.seq is strictly increasing within a case
- verdict terminates a case

## Rust Notes

- All unions are discriminated.
- Optional and nullable fields should remain distinct in downstream schemas.
- Observation order is explicit and must not depend on map iteration.
- The contract requires observable equivalence, not renderer identity.
- Frame cells and layout exports should be serializable without JS runtime concepts.
- Input event discriminants should remain stable and order-sensitive.

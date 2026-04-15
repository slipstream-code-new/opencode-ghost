# tcb-inventory.md

> Generated from `graph/contract-graph.jsonl`. Do not edit directly.

## Trusted Elements

| ID | Path | Assumption strata | Note |
| --- | --- | --- | --- |
| `artifact.script.extract` | `script/extract.ts` | `harness,environment` | Deterministic extractor for inventories and file-level traceability. |
| `artifact.script.render` | `script/render.ts` | `harness` | Generator for governance views derived from the contract graph. |
| `artifact.script.check` | `script/check.ts` | `harness` | Validation script for JSON artifacts, graph references, and required paths. |
| `artifact.script.commute_runtime` | `script/commute.ts` | `abstraction,harness` | Machine-checks the permission-cycle commuting diagram for the runtime witness slice. |
| `artifact.script.certify_runtime` | `script/certify.ts` | `harness` | Builds the runtime-formal source-first certification transcript. |
| `artifact.script.commute_tui` | `script/tui-commute.ts` | `abstraction,normalization,harness` | Machine-checks the commuting diagrams for the certified TUI case set. |
| `artifact.script.certify_tui` | `script/tui-certify.ts` | `harness` | Builds the TUI-certified source-first certification transcripts for the promoted case set. |
| `artifact.script.verify_all` | `verify-all` | `environment,harness` | Pinned verification entrypoint invoking all phase hooks in deterministic order. |
| `artifact.script.normalize` | `script/normalize.ts` | `normalization,harness` | Validates determinism, idempotence, monotonic erasure, and semantic preservation for runtime and TUI normalizers. |
| `artifact.script.determinism` | `script/determinism.ts` | `environment,harness` | Checks that generated inventories, reports, evidence, and certification transcripts are byte-stable across regeneration. |
| `artifact.script.freeze` | `script/freeze.ts` | `abstraction,harness` | Generates the bootstrap semantic-freeze report from graph coverage and certification state. |
| `artifact.script.profile_certify` | `script/profile-certify.ts` | `harness` | Aggregates case-level source-first certification transcripts into profile-level certification summaries. |

## Summary

| Class | Count |
| --- | --- |
| trusted_artifacts | 12 |
| abstraction_bound | 3 |
| harness_bound | 12 |
| environment_bound | 3 |
| normalization_bound | 2 |

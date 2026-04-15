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
| `artifact.script.commute_tui` | `script/tui-commute.ts` | `abstraction,normalization,harness` | Machine-checks the permission-view commuting diagram for the certified TUI witness slice. |
| `artifact.script.certify_tui` | `script/tui-certify.ts` | `harness` | Builds the TUI-certified source-first certification transcript. |
| `artifact.script.verify_all` | `verify-all` | `environment,harness` | Pinned verification entrypoint invoking all phase hooks in deterministic order. |
| `artifact.script.normalize` | `script/normalize.ts` | `normalization,harness` | Validates determinism, idempotence, monotonic erasure, and semantic preservation for runtime and TUI normalizers. |

## Summary

| Class | Count |
| --- | --- |
| trusted_artifacts | 9 |
| abstraction_bound | 2 |
| harness_bound | 9 |
| environment_bound | 2 |
| normalization_bound | 2 |

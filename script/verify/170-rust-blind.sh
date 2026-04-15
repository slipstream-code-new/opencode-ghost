#!/usr/bin/env bash
set -euo pipefail

root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$root"

echo "==> rust blind consumer"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

mkdir -p "$tmp/contracts/runtime/cases" "$tmp/contracts/tui/cases" "$tmp/evidence/traceability"
cp contracts/runtime/cases/*.json "$tmp/contracts/runtime/cases/"
cp contracts/tui/cases/*.json "$tmp/contracts/tui/cases/"
cp evidence/traceability/commuting.runtime.*.json "$tmp/evidence/traceability/"
cp evidence/traceability/commuting.tui.*.json "$tmp/evidence/traceability/"

cargo run --quiet --manifest-path consumer/rust-blind/Cargo.toml -- "$tmp" >/tmp/opencode-ghost-rust-blind.txt

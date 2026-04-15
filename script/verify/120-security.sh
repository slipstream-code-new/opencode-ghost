#!/usr/bin/env bash
set -euo pipefail

root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$root"

echo "==> security commuting and certification"
bun script/security-commute.ts --check
bun script/security-certify.ts --check

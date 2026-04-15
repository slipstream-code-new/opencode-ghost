#!/usr/bin/env bash
set -euo pipefail

root="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$root"

echo "==> integrations commuting and certification"
bun script/integrations-commute.ts --check
bun script/integrations-certify.ts --check

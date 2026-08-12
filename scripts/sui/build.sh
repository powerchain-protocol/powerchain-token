#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
command -v sui >/dev/null || { echo "sui CLI is required"; exit 1; }
sui --version
node scripts/sui/check-zero-genesis.mjs
node scripts/production/check-sui-capability.mjs
sui move build --path contracts/wpwrc
sui move test --path contracts/wpwrc

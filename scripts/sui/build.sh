#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT/programs/sui/wpwrc"
command -v sui >/dev/null || { echo "sui CLI is required"; exit 1; }
sui --version
sui move build
sui move test

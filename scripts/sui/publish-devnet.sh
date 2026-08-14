#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

[[ "${WPWRC_DEVNET_PUBLISH_ENABLED:-false}" == "true" ]] || {
  echo "Set WPWRC_DEVNET_PUBLISH_ENABLED=true for intentional Devnet publish." >&2
  exit 2
}

bash scripts/sui/check-cli.sh

EXPECTED_ENV="${SUI_DEVNET_ENV_ALIAS:-devnet}"
bash scripts/sui/assert-active-env.sh "$EXPECTED_ENV"

OUT="deployments/devnet/sui"
mkdir -p "$OUT/raw"

sui move build --path contracts/wpwrc

sui client publish \
  contracts/wpwrc \
  --json \
  > "$OUT/raw/publish.json"

node scripts/sui/record-publish.mjs \
  devnet \
  "$OUT/raw/publish.json" \
  "$OUT/evidence.json"

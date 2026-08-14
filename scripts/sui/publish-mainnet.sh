#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

[[ "${WPWRC_MAINNET_ENABLED:-false}" == "true" ]] || {
  echo "Set WPWRC_MAINNET_ENABLED=true only during an approved release window." >&2
  exit 2
}

[[ "${WPWRC_MAINNET_CONFIRMATION:-}" == "WPWRC-1.0.0-MAINNET" ]] || {
  echo "Set WPWRC_MAINNET_CONFIRMATION=WPWRC-1.0.0-MAINNET" >&2
  exit 2
}

: "${SUI_MAINNET_RPC_URL:?SUI_MAINNET_RPC_URL is required}"

bash scripts/sui/check-cli.sh

EXPECTED_ENV="${SUI_MAINNET_ENV_ALIAS:?SUI_MAINNET_ENV_ALIAS is required}"
bash scripts/sui/assert-active-env.sh "$EXPECTED_ENV"

OUT="deployments/mainnet/sui"
mkdir -p "$OUT/raw"

sui move build --path contracts/wpwrc

sui client publish \
  contracts/wpwrc \
  --json \
  > "$OUT/raw/publish.json"

node scripts/sui/record-publish.mjs \
  mainnet \
  "$OUT/raw/publish.json" \
  "$OUT/evidence.json"

echo "Publish JSON captured."
echo "Verify package/object IDs and checkpoint from independent Sui RPCs before release authorization."

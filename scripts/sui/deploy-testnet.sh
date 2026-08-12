#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

command -v sui >/dev/null || { echo "sui CLI is required"; exit 1; }
command -v jq >/dev/null || { echo "jq is required"; exit 1; }

ENV="$(sui client active-env)"
[[ "$ENV" == "testnet" ]] || { echo "Expected active Sui env=testnet, got: $ENV"; exit 1; }

ADDRESS="$(sui client active-address)"
echo "Deploying wPWRC from active address: $ADDRESS"
echo "Expected local alias: powerchain"

bash scripts/sui/build.sh

OUT="deployments/sui/testnet-publish.json"
mkdir -p "$(dirname "$OUT")"
(
  cd programs/sui/wpwrc
  sui client publish --gas-budget "${SUI_GAS_BUDGET:-100000000}" --json
) | tee "$OUT"

PACKAGE_ID="$(jq -r '.objectChanges[]? | select(.type=="published") | .packageId' "$OUT" | head -1)"
CONTROLLER_ID="$(jq -r '.objectChanges[]? | select(.objectType? | contains("::wpwrc::BridgeController")) | .objectId' "$OUT" | head -1)"
CURRENCY_ID="$(jq -r '.objectChanges[]? | select(.objectType? | contains("::coin_registry::Currency<")) | .objectId' "$OUT" | head -1)"

[[ -n "$PACKAGE_ID" && "$PACKAGE_ID" != "null" ]] || { echo "Could not parse package ID"; exit 1; }
[[ -n "$CONTROLLER_ID" && "$CONTROLLER_ID" != "null" ]] || { echo "Could not parse BridgeController ID"; exit 1; }

COIN_TYPE="${PACKAGE_ID}::wpwrc::WPWRC"

cat <<EOF
Published wPWRC testnet package.
Package ID:        $PACKAGE_ID
Coin type:         $COIN_TYPE
BridgeController:  $CONTROLLER_ID
Currency object:   ${CURRENCY_ID:-<inspect publish output>}

IMPORTANT:
OTW currencies require coin_registry::finalize_registration after publish.
Inspect $OUT and finalize the created Currency object before treating the
deployment as registered/ready.
EOF

#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

command -v sui >/dev/null || { echo "sui CLI is required"; exit 1; }
command -v jq >/dev/null || { echo "jq is required"; exit 1; }

node scripts/sui/check-zero-genesis.mjs

ENV="$(sui client active-env)"
[[ "$ENV" == "testnet" ]] || { echo "Expected active Sui env=testnet, got: $ENV"; exit 1; }

EXPECTED_POWERCHAIN_ADDRESS="0x4a4a81c5e4a520c1b4d7b5b572a0567f48c6c7e85257f0a13e65639cfba49fb1"
ADDRESS="$(sui client active-address)"
[[ "$ADDRESS" == "$EXPECTED_POWERCHAIN_ADDRESS" ]] || {
  echo "Active Sui address does not match alias powerchain."
  echo "Expected: $EXPECTED_POWERCHAIN_ADDRESS"
  echo "Actual:   $ADDRESS"
  exit 1
}
echo "Publishing wPWRC from configured publisher alias address: $ADDRESS"
echo "Expected local alias: powerchain"
echo "Bridge authority and governor must be configured separately after publish."

bash scripts/sui/build.sh

OUT="deployments/sui/testnet-publish.json"
mkdir -p "$(dirname "$OUT")"
(
  cd contracts/wpwrc
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

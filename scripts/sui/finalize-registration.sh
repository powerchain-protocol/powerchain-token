#!/usr/bin/env bash
set -euo pipefail

NETWORK="${1:-}"
PACKAGE_ID="${2:-}"
CURRENCY_OBJECT_ID="${3:-}"

[[ "$NETWORK" == "testnet" || "$NETWORK" == "mainnet" ]] || {
  echo "Usage: $0 <testnet|mainnet> <package-id> <currency-object-id>"
  exit 1
}
[[ "$PACKAGE_ID" =~ ^0x[0-9a-fA-F]{1,64}$ ]] || { echo "Invalid package ID"; exit 1; }
[[ "$CURRENCY_OBJECT_ID" =~ ^0x[0-9a-fA-F]{1,64}$ ]] || { echo "Invalid Currency object ID"; exit 1; }

ACTIVE_ENV="$(sui client active-env)"
[[ "$ACTIVE_ENV" == "$NETWORK" ]] || {
  echo "Active Sui env is '$ACTIVE_ENV', expected '$NETWORK'"
  exit 1
}

COIN_TYPE="${PACKAGE_ID}::wpwrc::WPWRC"

sui client ptb   --assign @"${CURRENCY_OBJECT_ID}" currency_to_promote   --move-call 0x2::coin_registry::finalize_registration "${COIN_TYPE}" @0xc currency_to_promote

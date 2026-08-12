#!/usr/bin/env bash
set -euo pipefail
[[ "${WPWRC_MAINNET_ENABLED:-false}" == "true" ]] || {
  echo "Set WPWRC_MAINNET_ENABLED=true after testnet qualification."
  exit 1
}
[[ "${WPWRC_MAINNET_CONFIRMATION:-}" == "WPWRC-1.0.0-MAINNET" ]] || {
  echo "Set WPWRC_MAINNET_CONFIRMATION=WPWRC-1.0.0-MAINNET"
  exit 1
}
ENV="$(sui client active-env)"
[[ "$ENV" == "mainnet" ]] || { echo "Expected active Sui env=mainnet, got: $ENV"; exit 1; }
echo "Mainnet publication is gated. Run scripts/sui/build.sh and review docs/SUI_BRIDGE.md first."
echo "Then publish manually from programs/sui/wpwrc and preserve the --json evidence."

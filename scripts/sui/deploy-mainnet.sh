#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"
[[ "${WPWRC_MAINNET_ENABLED:-false}" == "true" ]] || { echo "Set WPWRC_MAINNET_ENABLED=true only after testnet qualification."; exit 1; }
[[ "${WPWRC_MAINNET_CONFIRMATION:-}" == "WPWRC-1.0.0-MAINNET" ]] || { echo "Set WPWRC_MAINNET_CONFIRMATION=WPWRC-1.0.0-MAINNET"; exit 1; }
[[ "${WPWRC_SUI_FRAMEWORK_REV:-}" =~ ^[0-9a-fA-F]{40}$ ]] || { echo "WPWRC_SUI_FRAMEWORK_REV must be an immutable reviewed 40-hex Git commit."; exit 1; }
command -v sui >/dev/null || { echo "sui CLI is required"; exit 1; }
command -v jq >/dev/null || { echo "jq is required"; exit 1; }
[[ "$(sui client active-env)" == "mainnet" ]] || { echo "Expected active Sui env=mainnet"; exit 1; }
node scripts/sui/check-zero-genesis.mjs
node scripts/production/check-sui-capability.mjs
node scripts/security/check-wpwrc-spec.mjs
if grep -q 'rev = "framework/' contracts/wpwrc/Move.toml; then
  echo "Refusing Mainnet build/publish: contracts/wpwrc/Move.toml still uses a moving Sui framework branch."
  echo "Pin the reviewed commit: $WPWRC_SUI_FRAMEWORK_REV"
  exit 1
fi
sui move build --path contracts/wpwrc
cat <<EOF
Mainnet source preflight passed.
Publishing remains an explicit operator action so JSON evidence can be reviewed and preserved.
Use:
  sui client publish contracts/wpwrc --gas-budget <REVIEWED_BUDGET> --json | tee deployments/sui/mainnet-publish.json
Then finalize OTW Currency registration, verify zero wPWRC supply and the shared BridgeController, and generate the deployment manifest.
EOF

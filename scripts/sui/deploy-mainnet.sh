#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

[[ "${WPWRC_MAINNET_ENABLED:-false}" == "true" ]] || {
  echo "Set WPWRC_MAINNET_ENABLED=true only after testnet qualification."
  exit 1
}
[[ "${WPWRC_MAINNET_CONFIRMATION:-}" == "WPWRC-1.0.0-MAINNET" ]] || {
  echo "Set WPWRC_MAINNET_CONFIRMATION=WPWRC-1.0.0-MAINNET"
  exit 1
}
command -v sui >/dev/null || { echo "sui CLI is required"; exit 1; }
command -v jq >/dev/null || { echo "jq is required"; exit 1; }
[[ "$(sui client active-env)" == "mainnet" ]] || {
  echo "Expected active Sui env=mainnet"
  exit 1
}

grep -Eq 'edition[[:space:]]*=[[:space:]]*"2024"' contracts/wpwrc/Move.toml || {
  echo "contracts/wpwrc/Move.toml must use Move edition 2024."
  exit 1
}
if grep -Eq '^Sui[[:space:]]*=' contracts/wpwrc/Move.toml; then
  echo "Do not declare Sui framework as an explicit dependency for Move edition 2024."
  exit 1
fi

node scripts/sui/check-zero-genesis.mjs
node scripts/production/check-sui-capability.mjs
node scripts/security/check-wpwrc-spec.mjs
sui move build --path contracts/wpwrc
[[ -f contracts/wpwrc/Move.lock ]] || {
  echo "Sui build did not produce contracts/wpwrc/Move.lock; refusing Mainnet publish."
  exit 1
}

MOVE_LOCK_SHA256="$(node -e 'const fs=require("node:fs"),c=require("node:crypto");process.stdout.write(c.createHash("sha256").update(fs.readFileSync("contracts/wpwrc/Move.lock")).digest("hex"))')"
SUI_VERSION="$(sui --version)"

cat <<EOF2
Mainnet source/build preflight passed.
Sui CLI: $SUI_VERSION
Move.lock SHA-256: $MOVE_LOCK_SHA256

Publishing remains an explicit operator action so JSON evidence can be reviewed and preserved.
Use:
  sui client publish contracts/wpwrc --gas-budget <REVIEWED_BUDGET> --json | tee deployments/sui/mainnet-publish.json

Then verify zero wPWRC genesis/circulating state, the shared BridgeController,
metadata capability custody, bridge authority/governor separation, and generate
the deployment manifest with scripts/sui/write-deployment-manifest.mjs.
EOF2

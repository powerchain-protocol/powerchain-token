#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

[[ "${PWRC_MAINNET_DEPLOY_ENABLED:-false}" == "true" ]] || {
  echo "Set PWRC_MAINNET_DEPLOY_ENABLED=true only during an approved release window." >&2
  exit 2
}

[[ "${PWRC_MAINNET_DEPLOY_CONFIRMATION:-}" == "PWRC-1.0.0-DEPLOY-SOLANA" ]] || {
  echo "Set PWRC_MAINNET_DEPLOY_CONFIRMATION=PWRC-1.0.0-DEPLOY-SOLANA" >&2
  exit 2
}

node scripts/mainnet/preflight.mjs

TOKEN_ID="${PWRC_TOKEN_PROGRAM_ID_MAINNET}"
LOCK_ID="${PWRC_LOCK_PROGRAM_ID_MAINNET}"
RPC="${PWRC_MAINNET_RPC_URL}"

bash scripts/programs/check-program-keypair.sh \
  pwrc-token "$TOKEN_ID" "$PWRC_TOKEN_PROGRAM_KEYPAIR"

bash scripts/programs/check-program-keypair.sh \
  pwrc-lock "$LOCK_ID" "$PWRC_LOCK_PROGRAM_KEYPAIR"

OUT="deployments/mainnet/solana"
mkdir -p "$OUT/raw"

deploy_one() {
  local name="$1"
  local id="$2"
  local keypair="$3"
  local binary="$4"

  solana \
    --url "$RPC" \
    --keypair "$PWRC_MAINNET_DEPLOYER_KEYPAIR" \
    program deploy "$binary" \
    --program-id "$keypair" \
    | tee "$OUT/raw/${name}-deploy.txt"

  solana \
    --url "$RPC" \
    program show "$id" \
    | tee "$OUT/raw/${name}-show.txt"
}

deploy_one \
  pwrc-token \
  "$TOKEN_ID" \
  "$PWRC_TOKEN_PROGRAM_KEYPAIR" \
  target/deploy/pwrc_token.so

deploy_one \
  pwrc-lock \
  "$LOCK_ID" \
  "$PWRC_LOCK_PROGRAM_KEYPAIR" \
  target/deploy/pwrc_lock.so

echo "Deployment commands completed."
echo "Run independent RPC verification and Anchor verify before creating release evidence."

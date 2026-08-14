#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

[[ "${PWRC_DEVNET_DEPLOY_ENABLED:-false}" == "true" ]] || {
  echo "Set PWRC_DEVNET_DEPLOY_ENABLED=true for an intentional Devnet deployment." >&2
  exit 2
}

: "${PWRC_DEVNET_DEPLOYER_KEYPAIR:?PWRC_DEVNET_DEPLOYER_KEYPAIR is required}"
: "${PWRC_TOKEN_PROGRAM_KEYPAIR:?PWRC_TOKEN_PROGRAM_KEYPAIR is required}"
: "${PWRC_LOCK_PROGRAM_KEYPAIR:?PWRC_LOCK_PROGRAM_KEYPAIR is required}"

RPC="${PWRC_DEVNET_RPC_URL:-https://api.devnet.solana.com}"
TOKEN_ID="PWRCpWCpQ8BRn3pzMnvaTzMK9Q2GsxuLx7QgJgduLSu"
LOCK_ID="${PWRC_LOCK_PROGRAM_ID_DEVNET:?PWRC_LOCK_PROGRAM_ID_DEVNET is required}"

node scripts/devnet/preflight.mjs

bash scripts/programs/check-program-keypair.sh \
  pwrc-token "$TOKEN_ID" "$PWRC_TOKEN_PROGRAM_KEYPAIR"

bash scripts/programs/check-program-keypair.sh \
  pwrc-lock "$LOCK_ID" "$PWRC_LOCK_PROGRAM_KEYPAIR"

OUT="deployments/devnet/solana"
mkdir -p "$OUT/raw"

deploy_one() {
  local name="$1"
  local id="$2"
  local keypair="$3"
  local binary="$4"

  solana \
    --url "$RPC" \
    --keypair "$PWRC_DEVNET_DEPLOYER_KEYPAIR" \
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

PWRC_DEVNET_RPC_URL="$RPC" \
node scripts/devnet/record-solana.mjs

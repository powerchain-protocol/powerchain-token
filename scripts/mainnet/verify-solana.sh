#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

: "${PWRC_MAINNET_RPC_URL:?PWRC_MAINNET_RPC_URL is required}"
: "${PWRC_RPC_URL_SECONDARY:?PWRC_RPC_URL_SECONDARY is required}"
: "${PWRC_TOKEN_PROGRAM_ID_MAINNET:?PWRC_TOKEN_PROGRAM_ID_MAINNET is required}"
: "${PWRC_LOCK_PROGRAM_ID_MAINNET:?PWRC_LOCK_PROGRAM_ID_MAINNET is required}"

[[ "$PWRC_MAINNET_RPC_URL" != "$PWRC_RPC_URL_SECONDARY" ]] || {
  echo "PWRC_SECONDARY_RPC_MUST_DIFFER" >&2
  exit 2
}

OUT="deployments/mainnet/solana"
mkdir -p "$OUT/raw"

for spec in \
  "pwrc-token:$PWRC_TOKEN_PROGRAM_ID_MAINNET" \
  "pwrc-lock:$PWRC_LOCK_PROGRAM_ID_MAINNET"; do
  name="${spec%%:*}"
  id="${spec#*:}"

  solana --url "$PWRC_MAINNET_RPC_URL" program show "$id" \
    | tee "$OUT/raw/${name}-primary-show.txt"

  solana --url "$PWRC_RPC_URL_SECONDARY" program show "$id" \
    | tee "$OUT/raw/${name}-secondary-show.txt"
done

anchor verify -p pwrc_token "$PWRC_TOKEN_PROGRAM_ID_MAINNET" \
  | tee "$OUT/raw/pwrc-token-anchor-verify.txt"

anchor verify -p pwrc_lock "$PWRC_LOCK_PROGRAM_ID_MAINNET" \
  | tee "$OUT/raw/pwrc-lock-anchor-verify.txt"

echo "Verification outputs written under $OUT/raw."
echo "They must still be bound into config/mainnet/evidence.json."

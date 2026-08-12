#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/lib.sh"
for cmd in solana spl-token node; do need "$cmd"; done
require_mainnet_gate
require_precommitted_mainnet_mint
configure_cli
[[ -n "${PWRC_METADATA_URI:-}" ]] || die "PWRC_METADATA_URI required"

OUT="$(deployment_dir)"
mkdir -p "$OUT/evidence"
[[ ! -e "$OUT/deployment.env" ]] || die "Deployment already initialized: $OUT/deployment.env"
PWRC_CLUSTER="$PWRC_CLUSTER" node scripts/seal-inputs.mjs >/dev/null
journal "PREPARED" "INPUTS_LOCKED"
trap 'journal "FAILED" "DEPLOY_ABORTED" || true' ERR

MINT_KEYPAIR_ARGS=()
if [[ -n "${PWRC_MINT_KEYPAIR:-}" ]]; then
  [[ -f "$PWRC_MINT_KEYPAIR" ]] || die "PWRC_MINT_KEYPAIR does not exist"
  MINT_KEYPAIR_ARGS+=("$PWRC_MINT_KEYPAIR")
fi

log "Creating Token-2022 mint with metadata support"
CREATE_OUT="$OUT/evidence/create-mint.txt"
spl-token create-token "${MINT_KEYPAIR_ARGS[@]}" \
  --program-id "$TOKEN_2022_PROGRAM_ID" \
  --decimals "$PWRC_DECIMALS" \
  --enable-metadata | tee "$CREATE_OUT"

MINT="$(awk '/Address:/ {print $2}' "$CREATE_OUT" | tail -n1)"
CREATE_SIG="$(awk '/Signature:/ {print $2}' "$CREATE_OUT" | tail -n1)"
[[ -n "$MINT" ]] || die "Could not parse mint address from SPL Token CLI output"
assert_expected_mint "$MINT"
journal "MINT_CREATED" "CREATE_MINT" "$CREATE_SIG"

log "Initializing metadata"
META_OUT="$OUT/evidence/initialize-metadata.txt"
spl-token initialize-metadata "$MINT" "PowerChain" "PWRC" "$PWRC_METADATA_URI" | tee "$META_OUT"
META_SIG="$(awk '/Signature:/ {print $2}' "$META_OUT" | tail -n1)"
journal "METADATA_INITIALIZED" "INITIALIZE_METADATA" "$META_SIG"

log "Creating genesis treasury token account for deployment signer"
TREASURY_OUT="$OUT/evidence/create-treasury.txt"
spl-token create-account "$MINT" | tee "$TREASURY_OUT"
TREASURY="$(awk '/Creating account/ {print $3}' "$TREASURY_OUT" | tail -n1)"
TREASURY_SIG="$(awk '/Signature:/ {print $2}' "$TREASURY_OUT" | tail -n1)"
[[ -n "$TREASURY" ]] || die "Could not parse treasury token-account address"
journal "TREASURY_CREATED" "CREATE_TREASURY" "$TREASURY_SIG"

log "Minting the single canonical genesis amount: $PWRC_SUPPLY PWRC"
MINT_OUT="$OUT/evidence/mint-genesis.txt"
spl-token mint "$MINT" "$PWRC_SUPPLY" "$TREASURY" | tee "$MINT_OUT"
GENESIS_SIG="$(awk '/Signature:/ {print $2}' "$MINT_OUT" | tail -n1)"
journal "GENESIS_MINTED" "MINT_GENESIS" "$GENESIS_SIG"

cat > "$OUT/deployment.env" <<MANIFEST
PWRC_VERSION=1.0.0
PWRC_MANIFEST_CLUSTER=$PWRC_CLUSTER
PWRC_MINT=$MINT
PWRC_TREASURY_ACCOUNT=$TREASURY
PWRC_DECIMALS=$PWRC_DECIMALS
PWRC_GENESIS_SUPPLY=$PWRC_SUPPLY
PWRC_RAW_SUPPLY=$PWRC_RAW_SUPPLY
PWRC_TOKEN_PROGRAM=$TOKEN_2022_PROGRAM_ID
PWRC_METADATA_URI=$PWRC_METADATA_URI
PWRC_CREATE_MINT_SIGNATURE=$CREATE_SIG
PWRC_METADATA_SIGNATURE=$META_SIG
PWRC_TREASURY_SIGNATURE=$TREASURY_SIG
PWRC_GENESIS_MINT_SIGNATURE=$GENESIS_SIG
PWRC_DEPLOYMENT_STATUS=GENESIS_MINTED
MANIFEST

node scripts/write-summary.mjs "$PWRC_CLUSTER" "$MINT" "$TREASURY"
log "Genesis created. Mint: $MINT"
log "Treasury account: $TREASURY"
trap - ERR
log "Mint authority is still active. VERIFY before any finalization."

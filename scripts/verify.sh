#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/lib.sh"
for cmd in solana spl-token node; do need "$cmd"; done
require_mainnet_gate
configure_cli
load_manifest
assert_expected_mint "$PWRC_MINT"

OUT="$(deployment_dir)"
mkdir -p "$OUT/evidence"
node scripts/verify-journal.mjs "$OUT/journal.jsonl" > "$OUT/evidence/journal-verification.json"
node scripts/verify-chain.mjs "$PWRC_MINT" genesis | tee "$OUT/evidence/genesis-verification.json"

for item in \
  "create-mint:$PWRC_CREATE_MINT_SIGNATURE" \
  "metadata:$PWRC_METADATA_SIGNATURE" \
  "treasury:$PWRC_TREASURY_SIGNATURE" \
  "genesis:$PWRC_GENESIS_MINT_SIGNATURE"; do
  name="${item%%:*}"; sig="${item#*:}"
  [[ -n "$sig" ]] || die "Missing signature for $name"
  bash scripts/verify-signature.sh "$sig" > "$OUT/evidence/${name}-confirmation.json"
done

sed -i.bak 's/^PWRC_DEPLOYMENT_STATUS=.*/PWRC_DEPLOYMENT_STATUS=GENESIS_VERIFIED/' "$(manifest_file)" && rm -f "$(manifest_file).bak"
node scripts/update-status.mjs "$PWRC_CLUSTER" GENESIS_VERIFIED
journal "GENESIS_VERIFIED" "VERIFY_GENESIS"
log "Genesis verification PASS"

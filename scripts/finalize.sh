#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/lib.sh"
for cmd in solana spl-token node; do need "$cmd"; done
require_mainnet_gate
require_finalization_gate
require_precommitted_mainnet_mint
configure_cli
load_manifest
assert_expected_mint "$PWRC_MINT"

[[ "${PWRC_DEPLOYMENT_STATUS:-}" == "GENESIS_VERIFIED" ]] || \
  die "Refusing finalization: deployment status must be GENESIS_VERIFIED"

OUT="$(deployment_dir)"
mkdir -p "$OUT/evidence"
node scripts/verify-journal.mjs "$OUT/journal.jsonl" > "$OUT/evidence/pre-finalization-journal.json"
node scripts/verify-chain.mjs "$PWRC_MINT" genesis "$(cluster_url)" > "$OUT/evidence/pre-finalization.json"
journal "FINALIZATION_APPROVED" "PRECONDITIONS_VERIFIED"

log "IRREVERSIBLE: disabling mint authority for $PWRC_MINT on $PWRC_CLUSTER"
FINALIZE_OUT="$OUT/evidence/revoke-mint-authority.txt"
spl-token authorize "$PWRC_MINT" mint --disable | tee "$FINALIZE_OUT"
REVOKE_SIG="$(awk '/Signature:/ {print $2}' "$FINALIZE_OUT" | tail -n1)"
[[ -n "$REVOKE_SIG" ]] || die "Could not parse mint-authority revocation signature"
journal "MINT_AUTHORITY_REVOKED" "REVOKE_MINT_AUTHORITY" "$REVOKE_SIG"

bash scripts/verify-signature.sh "$REVOKE_SIG" > "$OUT/evidence/revoke-mint-confirmation.json"
node scripts/verify-chain.mjs "$PWRC_MINT" finalized "$(cluster_url)" | tee "$OUT/evidence/final-verification.json"
spl-token display "$PWRC_MINT" | tee "$OUT/final-state.txt"
journal "FINALIZED" "POSTCONDITIONS_VERIFIED"
node scripts/verify-journal.mjs "$OUT/journal.jsonl" > "$OUT/evidence/final-journal-verification.json"

sed -i.bak 's/^PWRC_DEPLOYMENT_STATUS=.*/PWRC_DEPLOYMENT_STATUS=FINALIZED/' "$(manifest_file)" && rm -f "$(manifest_file).bak"
printf 'PWRC_REVOKE_MINT_SIGNATURE=%s\n' "$REVOKE_SIG" >> "$(manifest_file)"
node scripts/update-status.mjs "$PWRC_CLUSTER" FINALIZED
date -u +"%Y-%m-%dT%H:%M:%SZ" > "$OUT/finalized-at.txt"

log "PWRC FINALIZED"
log "Mint authority: NONE"
log "Freeze authority: NONE"
log "Generate proof with: PWRC_CLUSTER=$PWRC_CLUSTER pnpm pwrc:release"

#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/lib.sh"
for cmd in solana spl-token node; do need "$cmd"; done
require_mainnet_gate
node scripts/check-lockfile.mjs >/dev/null
configure_cli
RPC="$(cluster_url)"
[[ -n "${PWRC_METADATA_URI:-}" ]] || die "PWRC_METADATA_URI required"
SIGNER="$(solana address)"
BALANCE="$(solana balance)"
log "Version: $PWRC_VERSION"
log "Cluster: $PWRC_CLUSTER"
log "RPC: $RPC"
log "Signer: $SIGNER"
log "Balance: $BALANCE"
log "Metadata URI: $PWRC_METADATA_URI"
if [[ "$PWRC_CLUSTER" == "mainnet-beta" ]]; then
  [[ -n "${PWRC_EXPECTED_MINT:-}" ]] && log "Expected mint: $PWRC_EXPECTED_MINT" || log "Expected mint: not set yet (required before finalization)"
fi
log "Preflight PASS"

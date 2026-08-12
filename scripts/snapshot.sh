#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/lib.sh"
for cmd in solana spl-token; do need "$cmd"; done
configure_cli
load_manifest
assert_expected_mint "$PWRC_MINT"
OUT="$(deployment_dir)/snapshots"
mkdir -p "$OUT"
STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
spl-token display "$PWRC_MINT" > "$OUT/$STAMP.mint.txt"
solana account "$PWRC_MINT" --output json > "$OUT/$STAMP.account.json"
spl-token supply "$PWRC_MINT" > "$OUT/$STAMP.supply.txt"
log "Snapshot: $OUT/$STAMP.*"

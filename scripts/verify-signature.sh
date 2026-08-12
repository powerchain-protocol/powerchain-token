#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/lib.sh"
need solana
SIG="${1:-}"
[[ -n "$SIG" ]] || die "transaction signature required"
OUT="$(solana confirm -v --output json "$SIG" 2>/dev/null || true)"
[[ -n "$OUT" ]] || die "Could not retrieve transaction confirmation for $SIG"
printf '%s\n' "$OUT" | node -e '
let s=""; process.stdin.on("data",d=>s+=d).on("end",()=>{ const j=JSON.parse(s); const status=j.confirmationStatus ?? j.value?.confirmationStatus ?? j.status?.confirmationStatus; const err=j.err ?? j.value?.err ?? j.status?.err ?? null; if(status!=="finalized" || err!==null){ console.error(JSON.stringify({status,err})); process.exit(2); } console.log(JSON.stringify({signature:process.argv[1],finalized:true,err:null},null,2)); });' "$SIG"

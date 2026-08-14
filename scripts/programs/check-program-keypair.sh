#!/usr/bin/env bash
set -euo pipefail

LABEL="${1:?label required}"
EXPECTED="${2:?expected program id required}"
KEYPAIR="${3:?keypair path required}"

command -v solana-keygen >/dev/null 2>&1 || {
  echo "PWRC_SOLANA_KEYGEN_REQUIRED" >&2
  exit 1
}

[[ -f "$KEYPAIR" ]] || {
  echo "PWRC_PROGRAM_KEYPAIR_MISSING:${LABEL}:${KEYPAIR}" >&2
  exit 2
}

ACTUAL="$(solana-keygen pubkey "$KEYPAIR")"

[[ "$ACTUAL" == "$EXPECTED" ]] || {
  echo "PWRC_PROGRAM_KEYPAIR_ID_MISMATCH:${LABEL}:expected=${EXPECTED}:actual=${ACTUAL}" >&2
  exit 2
}

echo "PWRC_PROGRAM_KEYPAIR_OK:${LABEL}:${EXPECTED}"

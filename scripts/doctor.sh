#!/usr/bin/env bash
set -euo pipefail

source "$(dirname "$0")/lib.sh"

for cmd in solana spl-token node pnpm; do
  need "$cmd"
done
need_sha256

printf 'PowerChain doctor\n'
printf 'Version:    %s\n' "$PWRC_VERSION"
printf 'Solana:     '; solana --version
printf 'SPL Token:  '; spl-token --version
printf 'Node:       '; node --version
printf 'pnpm:       '; pnpm --version
printf 'SHA-256:    %s\n' "$(sha256_tool)"
printf 'Supply:     %s PWRC\n' "$PWRC_SUPPLY"
printf 'Decimals:   %s\n' "$PWRC_DECIMALS"
printf 'Token-2022: %s\n' "$TOKEN_2022_PROGRAM_ID"
printf 'Fee:        %s bps, cap %s PWRC\n' \
  "$PWRC_TRANSFER_FEE_BPS" \
  "$PWRC_MAX_TRANSFER_FEE_TOKENS"
printf '\n[PWRC] doctor PASS\n'

#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/lib.sh"
for cmd in solana spl-token node pnpm sha256sum; do need "$cmd"; done
printf 'Solana:    '; solana --version
printf 'SPL Token: '; spl-token --version
printf 'Node:      '; node --version
printf 'pnpm:      '; pnpm --version
printf '\nPWRC %s\nSupply: %s\nDecimals: %s\nProgram: %s\n' \
  "$PWRC_VERSION" "$PWRC_SUPPLY" "$PWRC_DECIMALS" "$TOKEN_2022_PROGRAM_ID"

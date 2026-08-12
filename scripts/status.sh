#!/usr/bin/env bash
set -euo pipefail
source "$(dirname "$0")/lib.sh"
load_manifest
configure_cli
assert_expected_mint "$PWRC_MINT"
printf 'PWRC %s\nCluster: %s\nStatus: %s\nMint: %s\nTreasury: %s\n\n' \
  "$PWRC_VERSION" "$PWRC_CLUSTER" "${PWRC_DEPLOYMENT_STATUS:-UNKNOWN}" "$PWRC_MINT" "${PWRC_TREASURY_ACCOUNT:-UNKNOWN}"
spl-token display "$PWRC_MINT"

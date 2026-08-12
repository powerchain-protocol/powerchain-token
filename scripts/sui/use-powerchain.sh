#!/usr/bin/env bash
set -euo pipefail

EXPECTED_ALIAS="powerchain"
EXPECTED_ADDRESS="0x4a4a81c5e4a520c1b4d7b5b572a0567f48c6c7e85257f0a13e65639cfba49fb1"

command -v sui >/dev/null || {
  echo "sui CLI is required"
  exit 1
}

sui client switch --address "$EXPECTED_ALIAS"
ACTIVE_ADDRESS="$(sui client active-address)"

[[ "$ACTIVE_ADDRESS" == "$EXPECTED_ADDRESS" ]] || {
  echo "PowerChain Sui alias/address mismatch."
  echo "Expected: $EXPECTED_ADDRESS"
  echo "Actual:   $ACTIVE_ADDRESS"
  exit 1
}

echo "PowerChain Sui identity verified"
echo "alias:   $EXPECTED_ALIAS"
echo "address: $ACTIVE_ADDRESS"

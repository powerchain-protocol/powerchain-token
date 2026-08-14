#!/usr/bin/env bash
set -euo pipefail

EXPECTED="${1:?expected Sui environment alias required}"

command -v sui >/dev/null 2>&1 || {
  echo "PWRC_SUI_CLI_REQUIRED" >&2
  exit 1
}

ACTIVE="$(sui client active-env | tr -d '\r' | tail -n 1 | xargs)"

[[ "$ACTIVE" == "$EXPECTED" ]] || {
  echo "PWRC_SUI_ACTIVE_ENV_MISMATCH:expected=${EXPECTED}:actual=${ACTIVE}" >&2
  exit 2
}

echo "PWRC_SUI_ACTIVE_ENV_OK:${ACTIVE}"

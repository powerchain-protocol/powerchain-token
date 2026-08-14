#!/usr/bin/env bash
set -euo pipefail

command -v sui >/dev/null 2>&1 || {
  echo "PWRC_SUI_CLI_REQUIRED" >&2
  exit 1
}

sui --version

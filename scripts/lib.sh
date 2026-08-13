#!/usr/bin/env bash
set -euo pipefail

TOKEN_2022_PROGRAM_ID="TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
PWRC_CANONICAL_MINT="PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc"
PWRC_DECIMALS="9"
PWRC_SUPPLY="18446000000"
PWRC_RAW_SUPPLY="18446000000000000000"
PWRC_TRANSFER_FEE_BPS="250"
PWRC_MAX_TRANSFER_FEE_TOKENS="1000000"
PWRC_VERSION="1.0.0"

log() { printf '[PWRC] %s
' "$*"; }
die() { printf '[PWRC] ERROR: %s
' "$*" >&2; exit 1; }
need() { command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"; }

cluster_url() {
  case "${PWRC_CLUSTER:-}" in
    devnet) printf '%s' "${PWRC_RPC_URL:-https://api.devnet.solana.com}" ;;
    mainnet-beta)
      [[ -n "${PWRC_RPC_URL:-${PWRC_MAINNET_RPC_URL:-}}" ]] || die "Dedicated mainnet RPC is required"
      local url="${PWRC_RPC_URL:-${PWRC_MAINNET_RPC_URL}}"
      [[ "$url" == https://* ]] || die "Mainnet RPC must use HTTPS"
      printf '%s' "$url"
      ;;
    *) die "PWRC_CLUSTER must be devnet or mainnet-beta" ;;
  esac
}

deployment_dir() { printf 'deployments/%s' "${PWRC_CLUSTER:?PWRC_CLUSTER missing}"; }
manifest_file() { printf '%s/deployment.env' "$(deployment_dir)"; }

require_mainnet_gate() {
  if [[ "${PWRC_CLUSTER:-}" == "mainnet-beta" && "${PWRC_MAINNET_ENABLED:-false}" != "true" ]]; then
    die "Mainnet disabled. Set PWRC_MAINNET_ENABLED=true only for an approved deployment session."
  fi
}

require_finalization_gate() {
  [[ "${PWRC_FINALIZATION_ENABLED:-false}" == "true" ]] ||
    die "Finalization disabled. Set PWRC_FINALIZATION_ENABLED=true only after verification."
  if [[ "${PWRC_CLUSTER:-}" == "mainnet-beta" ]]; then
    [[ "${PWRC_FINALIZATION_CONFIRMATION:-}" == "PWRC-1.0.0-IRREVERSIBLE" ]] ||
      die "Set PWRC_FINALIZATION_CONFIRMATION=PWRC-1.0.0-IRREVERSIBLE for mainnet finalization."
  fi
}

load_manifest() {
  local f="$(manifest_file)"
  local requested_cluster="${PWRC_CLUSTER:-}"
  [[ -f "$f" ]] || die "Missing deployment manifest: $f"
  # shellcheck disable=SC1090
  source "$f"
  [[ "${PWRC_VERSION:-}" == "1.0.0" ]] || die "Manifest version mismatch"
  [[ "${PWRC_MANIFEST_CLUSTER:-}" == "$requested_cluster" ]] ||
    die "Manifest cluster ${PWRC_MANIFEST_CLUSTER:-missing} does not match requested cluster $requested_cluster"
  PWRC_CLUSTER="$requested_cluster"
}

assert_expected_mint() {
  local mint="$1"
  if [[ -n "${PWRC_EXPECTED_MINT:-}" && "${PWRC_EXPECTED_MINT}" != "$mint" ]]; then
    die "Expected mint ${PWRC_EXPECTED_MINT}, manifest/on-chain mint is $mint"
  fi
  if [[ "${PWRC_CLUSTER:-}" == "mainnet-beta" ]]; then
    [[ "${PWRC_EXPECTED_MINT:-}" == "$PWRC_CANONICAL_MINT" ]] ||
      die "Mainnet PWRC_EXPECTED_MINT must equal canonical mint $PWRC_CANONICAL_MINT"
  fi
}

configure_cli() {
  local rpc="$(cluster_url)"
  solana config set --url "$rpc" >/dev/null
  if [[ -n "${PWRC_KEYPAIR:-}" ]]; then
    [[ -f "$PWRC_KEYPAIR" ]] || die "PWRC_KEYPAIR does not exist: $PWRC_KEYPAIR"
    solana config set --keypair "$PWRC_KEYPAIR" >/dev/null
  fi
}

parse_signature() { awk '/Signature:/ {print $2}' | tail -n1; }

require_precommitted_mainnet_mint() {
  if [[ "${PWRC_CLUSTER:-}" != "mainnet-beta" ]]; then return 0; fi
  [[ "${PWRC_EXPECTED_MINT:-}" == "$PWRC_CANONICAL_MINT" ]] ||
    die "Mainnet expected mint must be the reviewed canonical mint $PWRC_CANONICAL_MINT"
}

journal() {
  node scripts/journal.mjs "${PWRC_CLUSTER:?}" "$1" "$2" "${3:-}" >/dev/null
}


# Portable SHA-256 helpers.
sha256_tool() {
  if command -v sha256sum >/dev/null 2>&1; then
    printf '%s' "sha256sum"
  elif command -v shasum >/dev/null 2>&1; then
    printf '%s' "shasum"
  elif command -v openssl >/dev/null 2>&1; then
    printf '%s' "openssl"
  else
    return 1
  fi
}

need_sha256() {
  sha256_tool >/dev/null 2>&1 ||
    die "Missing SHA-256 tool. Install one of: sha256sum, shasum, openssl"
}

sha256_file() {
  local file="${1:?file required}"
  [[ -f "$file" ]] || die "SHA-256 input does not exist: $file"

  case "$(sha256_tool)" in
    sha256sum)
      sha256sum "$file" | awk '{print $1}'
      ;;
    shasum)
      shasum -a 256 "$file" | awk '{print $1}'
      ;;
    openssl)
      openssl dgst -sha256 "$file" | awk '{print $NF}'
      ;;
    *)
      die "No SHA-256 implementation available"
      ;;
  esac
}

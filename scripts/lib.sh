#!/usr/bin/env bash
set -euo pipefail

TOKEN_2022_PROGRAM_ID="TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
PWRC_DECIMALS="9"
PWRC_SUPPLY="18446000000"
PWRC_RAW_SUPPLY="18446000000000000000"
PWRC_VERSION="1.0.0"

log() { printf '[PWRC] %s\n' "$*"; }
die() { printf '[PWRC] ERROR: %s\n' "$*" >&2; exit 1; }
need() { command -v "$1" >/dev/null 2>&1 || die "Missing required command: $1"; }

cluster_url() {
  case "${PWRC_CLUSTER:-}" in
    devnet) printf '%s' "${PWRC_RPC_URL:-https://api.devnet.solana.com}" ;;
    mainnet-beta) printf '%s' "${PWRC_RPC_URL:-https://api.mainnet-beta.solana.com}" ;;
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
  if [[ "${PWRC_CLUSTER:-}" == "mainnet-beta" && -z "${PWRC_EXPECTED_MINT:-}" ]]; then
    die "PWRC_EXPECTED_MINT is required for mainnet verification/finalization"
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
  need solana-keygen
  [[ -n "${PWRC_MINT_KEYPAIR:-}" ]] || die "PWRC_MINT_KEYPAIR is required for mainnet so the mint can be precommitted before submission"
  [[ -f "$PWRC_MINT_KEYPAIR" ]] || die "PWRC_MINT_KEYPAIR does not exist: $PWRC_MINT_KEYPAIR"
  [[ -n "${PWRC_EXPECTED_MINT:-}" ]] || die "PWRC_EXPECTED_MINT is required for mainnet"
  local derived
  derived="$(solana-keygen pubkey "$PWRC_MINT_KEYPAIR")"
  [[ "$derived" == "$PWRC_EXPECTED_MINT" ]] || die "Mint keypair derives $derived but PWRC_EXPECTED_MINT=$PWRC_EXPECTED_MINT"
}

journal() {
  node scripts/journal.mjs "${PWRC_CLUSTER:?}" "$1" "$2" "${3:-}" >/dev/null
}

#!/usr/bin/env bash
set -euo pipefail

NODE_COMPAT="22.22.3"
PNPM="10.21.0"

echo "PowerChain 1.0.0 platform preflight"
echo "Architecture: $(uname -m)"
echo "Kernel: $(uname -r)"

if [ "$(uname -s)" = "Darwin" ]; then
  macos="$(sw_vers -productVersion)"
  major="${macos%%.*}"
  echo "macOS: $macos"

  if [ "$major" -lt 11 ]; then
    echo "PWRC_MACOS_UNSUPPORTED: macOS $macos" >&2
    exit 2
  fi

  echo "Native compatibility lane:"
  echo "  Node $NODE_COMPAT"
  echo "  pnpm $PNPM"
fi

node_path="$(command -v node 2>/dev/null || true)"
pnpm_path="$(command -v pnpm 2>/dev/null || true)"

echo "Detected node path: ${node_path:-unavailable}"
echo "Detected pnpm path: ${pnpm_path:-unavailable}"

case "$node_path" in
  *"/.nvm/versions/node/v26.7.0/bin/node"|*"/Library/pnpm/nodejs/26.7.0/bin/node")
    cat >&2 <<EOF
PWRC_STALE_BROKEN_NODE_SELECTED

Your current shell still selects the known-broken Node 26.7.0 binary:
  $node_path

Do NOT run pnpm yet.

Run this in the SAME terminal:

  source scripts/bootstrap/activate-node.sh

The script must be sourced so its PATH/nvm changes persist in your zsh session.
EOF
    exit 3
    ;;
esac

# Only execute Node if the path is not the known-broken project runtime.
if [ -n "$node_path" ]; then
  if node --version >/tmp/pwrc-node-version.$$ 2>/tmp/pwrc-node-error.$$; then
    echo "Current Node: $(cat /tmp/pwrc-node-version.$$)"
  else
    echo "PWRC_NODE_BINARY_CANNOT_START" >&2
    cat /tmp/pwrc-node-error.$$ >&2 || true
    rm -f /tmp/pwrc-node-version.$$ /tmp/pwrc-node-error.$$
    echo >&2
    echo "Repair in this shell with:" >&2
    echo "  source scripts/bootstrap/activate-node.sh" >&2
    exit 4
  fi
  rm -f /tmp/pwrc-node-version.$$ /tmp/pwrc-node-error.$$
else
  echo "Node is unavailable."
fi

echo
echo "Recommended:"
echo "  source scripts/bootstrap/activate-node.sh"

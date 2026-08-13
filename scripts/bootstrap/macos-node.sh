#!/usr/bin/env bash
set -euo pipefail

NODE_VERSION="22.22.3"

if [ "$(uname -s)" != "Darwin" ]; then
  echo "PWRC_MACOS_ONLY" >&2
  exit 2
fi

macos="$(sw_vers -productVersion)"
major="${macos%%.*}"

if [ "$major" -lt 11 ]; then
  cat >&2 <<EOF
PWRC_MACOS_UNSUPPORTED: macOS $macos

Use a supported macOS release or a supported Linux environment.
EOF
  exit 3
fi

# Remove the known incompatible project-pinned Node 26 copy from pnpm's private
# runtime cache. nvm's copy is left for nvm to manage, but it will not be used
# after the sourceable activation script switches the parent shell.
rm -rf "$HOME/Library/pnpm/nodejs/26.7.0"

cat <<EOF
PowerChain macOS bootstrap prepared.

IMPORTANT: an executed script cannot change the Node version of your parent
zsh session. Activate the repository runtime by SOURCING this file:

  source scripts/bootstrap/activate-node.sh

or:

  . scripts/bootstrap/activate-node.sh

Do not run pnpm until that command prints:

  version: v$NODE_VERSION
  pnpm version: 10.21.0

After activation:

  rm -rf node_modules
  pnpm store prune
  pnpm install
EOF

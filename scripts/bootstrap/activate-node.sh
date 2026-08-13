# PowerChain Node activation helper.
# IMPORTANT: source this file; do not execute it:
#   source scripts/bootstrap/activate-node.sh
#
# This script is intentionally POSIX-ish shell and does not invoke Node until
# after PATH has been moved away from known-broken Node 26.7.0 locations.

_pwrc_return() {
  return "$1" 2>/dev/null || exit "$1"
}

PWRC_NODE_VERSION="22.22.3"
PWRC_CLEAR_DEBUGGER_NODE_OPTIONS="true"

# VS Code Auto Attach can inject its debugger into every Node process. This is
# development instrumentation, not a project runtime requirement. Clear the
# known debugger bootloader options before invoking Node/Corepack.
case "${NODE_OPTIONS-}" in
  *"ms-vscode.js-debug"*|*"--inspect-publish-uid"*)
    unset NODE_OPTIONS
    unset VSCODE_INSPECTOR_OPTIONS 2>/dev/null || true
    ;;
esac
PWRC_PNPM_VERSION="10.21.0"
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"

_pwrc_strip_path_entry() {
  local target="$1"
  local result=""
  local entry=""

  local old_ifs="$IFS"
  IFS=':'
  for entry in $PATH; do
    if [ "$entry" = "$target" ]; then
      continue
    fi
    if [ -z "$result" ]; then
      result="$entry"
    else
      result="$result:$entry"
    fi
  done
  IFS="$old_ifs"

  PATH="$result"
  export PATH
}

# Remove known stale/broken project Node locations from the current shell before
# sourcing nvm. This avoids calling the incompatible binary accidentally.
_pwrc_strip_path_entry "$HOME/.nvm/versions/node/v26.7.0/bin"
_pwrc_strip_path_entry "$HOME/Library/pnpm/nodejs/26.7.0/bin"

hash -r 2>/dev/null || true
rehash 2>/dev/null || true

if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  echo "PWRC_NVM_NOT_FOUND: $NVM_DIR/nvm.sh" >&2
  echo "Install nvm, then source this script again." >&2
  _pwrc_return 4
fi

# shellcheck disable=SC1090
. "$NVM_DIR/nvm.sh"

# Clear any nvm-selected runtime inherited from shell startup, then activate the
# repository compatibility lane.
nvm deactivate >/dev/null 2>&1 || true

if ! nvm ls "$PWRC_NODE_VERSION" 2>/dev/null | grep -q "v$PWRC_NODE_VERSION"; then
  echo "Installing Node $PWRC_NODE_VERSION with nvm..."
  if ! nvm install "$PWRC_NODE_VERSION"; then
    echo "PWRC_NODE_INSTALL_FAILED" >&2
    _pwrc_return 5
  fi
fi

if ! nvm use "$PWRC_NODE_VERSION"; then
  echo "PWRC_NODE_ACTIVATION_FAILED" >&2
  _pwrc_return 6
fi

nvm alias default "$PWRC_NODE_VERSION" >/dev/null 2>&1 || true

hash -r 2>/dev/null || true
rehash 2>/dev/null || true

_pwrc_node_path="$(command -v node 2>/dev/null || true)"
_pwrc_expected_prefix="$NVM_DIR/versions/node/v$PWRC_NODE_VERSION/bin/"

case "$_pwrc_node_path" in
  "$_pwrc_expected_prefix"*)
    ;;
  *)
    echo "PWRC_NODE_PATH_MISMATCH" >&2
    echo "Expected under: $_pwrc_expected_prefix" >&2
    echo "Detected: ${_pwrc_node_path:-unavailable}" >&2
    _pwrc_return 7
    ;;
esac

if ! node --version >/tmp/pwrc-node-version.$$ 2>/tmp/pwrc-node-error.$$; then
  echo "PWRC_NODE_BINARY_CANNOT_START" >&2
  cat /tmp/pwrc-node-error.$$ >&2 || true
  rm -f /tmp/pwrc-node-version.$$ /tmp/pwrc-node-error.$$
  _pwrc_return 8
fi

_pwrc_detected_node="$(cat /tmp/pwrc-node-version.$$)"
rm -f /tmp/pwrc-node-version.$$ /tmp/pwrc-node-error.$$

if [ "$_pwrc_detected_node" != "v$PWRC_NODE_VERSION" ]; then
  echo "PWRC_NODE_VERSION_MISMATCH: $_pwrc_detected_node" >&2
  _pwrc_return 9
fi

if ! command -v corepack >/dev/null 2>&1; then
  echo "PWRC_COREPACK_UNAVAILABLE under Node $PWRC_NODE_VERSION" >&2
  _pwrc_return 10
fi

corepack enable
corepack prepare "pnpm@$PWRC_PNPM_VERSION" --activate

hash -r 2>/dev/null || true
rehash 2>/dev/null || true

if ! pnpm --version >/tmp/pwrc-pnpm-version.$$ 2>/tmp/pwrc-pnpm-error.$$; then
  echo "PWRC_PNPM_CANNOT_START" >&2
  cat /tmp/pwrc-pnpm-error.$$ >&2 || true
  rm -f /tmp/pwrc-pnpm-version.$$ /tmp/pwrc-pnpm-error.$$
  _pwrc_return 11
fi

_pwrc_detected_pnpm="$(cat /tmp/pwrc-pnpm-version.$$)"
rm -f /tmp/pwrc-pnpm-version.$$ /tmp/pwrc-pnpm-error.$$

if [ "$_pwrc_detected_pnpm" != "$PWRC_PNPM_VERSION" ]; then
  echo "PWRC_PNPM_VERSION_MISMATCH: $_pwrc_detected_pnpm" >&2
  _pwrc_return 12
fi

echo "PowerChain shell activated:"
echo "  node: $(command -v node)"
echo "  version: $_pwrc_detected_node"
echo "  pnpm: $(command -v pnpm)"
echo "  pnpm version: $_pwrc_detected_pnpm"
echo
echo "This shell is now ready for pnpm commands."

unset _pwrc_node_path _pwrc_expected_prefix _pwrc_detected_node _pwrc_detected_pnpm
unset -f _pwrc_strip_path_entry 2>/dev/null || true
unset -f _pwrc_return 2>/dev/null || true

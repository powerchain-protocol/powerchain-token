#!/usr/bin/env bash
set -euo pipefail

echo "PowerChain shell inspection"
echo "SHELL=${SHELL:-unknown}"
echo
echo "PATH entries:"
printf '%s\n' "$PATH" | tr ':' '\n' | nl -ba
echo

echo "Potential hard-coded Node/pnpm entries:"
found=0
for file in "$HOME/.zshenv" "$HOME/.zprofile" "$HOME/.zshrc" "$HOME/.profile"; do
  if [ -f "$file" ]; then
    matches="$(
      grep -nE '26\.7\.0|Library/pnpm/nodejs|NVM_BIN|nvm use|versions/node/v[0-9]+' "$file" 2>/dev/null || true
    )"
    if [ -n "$matches" ]; then
      found=1
      echo "--- $file ---"
      printf '%s\n' "$matches"
    fi
  fi
done

if [ "$found" -eq 0 ]; then
  echo "No obvious hard-coded Node runtime entries found."
fi

echo
echo "node => $(command -v node 2>/dev/null || echo unavailable)"
echo "pnpm => $(command -v pnpm 2>/dev/null || echo unavailable)"

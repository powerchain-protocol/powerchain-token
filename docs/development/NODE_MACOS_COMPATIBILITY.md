# Node.js and macOS Compatibility

PowerChain `1.0.0` uses Node `22.22.3` as the local compatibility baseline and
pnpm `10.21.0`.

## Critical shell behavior

`nvm use` changes the **current shell environment**. A bootstrap script that is
executed as a child process cannot permanently change the Node version of the
parent zsh session.

That means this:

```bash
bash scripts/bootstrap/macos-node.sh
```

can inspect/prepare the machine, but it cannot switch the Node used by commands
you type after that script exits.

The actual repair command is therefore sourceable:

```bash
source scripts/bootstrap/activate-node.sh
```

or:

```bash
. scripts/bootstrap/activate-node.sh
```

Run it in the **same Terminal tab/window** where you will later run pnpm.

## Diagnose without invoking the broken Node

```bash
bash scripts/bootstrap/platform-preflight.sh
```

The preflight now recognizes the known broken Node `26.7.0` path before it calls
`node --version`. It will tell you to source the activation script rather than
triggering another `dyld` abort.

Inspect shell startup/path configuration:

```bash
bash scripts/bootstrap/inspect-shell.sh
```

## Repair sequence

From the repository:

```bash
cd /Users/miko/github/powerchain/token

bash scripts/bootstrap/platform-preflight.sh
source scripts/bootstrap/activate-node.sh
```

The activation must finish with values equivalent to:

```text
node: .../.nvm/versions/node/v22.22.3/bin/node
version: v22.22.3
pnpm version: 10.21.0
```

Then, in that same shell:

```bash
rm -rf node_modules
pnpm store prune
pnpm install
```

Then:

```bash
pnpm pnpm:check
pnpm production:check
pnpm typecheck
pnpm test
pnpm fullstack:runtime-test
pnpm fullstack:test
```

## If Node 26 returns after opening a new Terminal

A shell startup file may contain a hard-coded Node 26 path or `nvm use 26.7.0`.

Run:

```bash
bash scripts/bootstrap/inspect-shell.sh
```

Remove hard-coded entries that point directly to:

```text
~/.nvm/versions/node/v26.7.0/bin
~/Library/pnpm/nodejs/26.7.0/bin
```

Prefer normal nvm initialization plus the repository `.nvmrc`.

## Why dependency cleanup alone does not fix this

`pnpm` itself needs a working Node runtime. If the selected Node executable
cannot start because `dyld` rejects it, commands such as `pnpm store prune`,
`pnpm install`, `esbuild` postinstall, TypeScript, and tests never reach project
code.

Fix the active shell runtime first; then clean/reinstall dependencies.

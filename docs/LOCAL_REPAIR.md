# Local Checkout Repair

**Version:** `1.0.0`

If an older PowerChain checkout still contains root-level `src/` or `utils/`,
the strict monorepo checker will fail even though those directories are no
longer part of the canonical layout.

Run a dry-run first:

```bash
pnpm monorepo:clean:dry-run
```

Apply the migration:

```bash
pnpm monorepo:clean
```

The command is non-destructive. Existing root `src/` and `utils/` directories
are moved to:

```text
.powerchain-migration-backup/
```

The backup directory is ignored by Git.

Then run:

```bash
pnpm workspace:doctor
pnpm install
pnpm pnpm:check
pnpm monorepo:check
pnpm typecheck
pnpm test
pnpm production:check
```

## IDL compatibility

The canonical binding is:

```ts
export * from "../../../../idl/bindings/interface.js";
```

A compatibility shim also exists at:

```text
packages/protocol/idl/bindings/interface.ts
```

so a stale checkout still using the old:

```ts
export * from "../../idl/bindings/interface.js";
```

can resolve while the source file is being migrated.

The shim is source compatibility only. It does not represent a generated
Mainnet Anchor IDL and does not satisfy deployment evidence gates.

## Metaplex

Metaplex dependencies are isolated in `@powerchain/metaplex` and should be
installed through the workspace:

```bash
pnpm install
pnpm metaplex:check
```

Do not install a second copy manually in the root or SDK package.

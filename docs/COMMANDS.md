# Command Reference

This reference is generated from the root `package.json` scripts for PowerChain
`1.0.0`.

Run scripts with:

```bash
pnpm <script>
```

Do not infer that a script can complete successfully without its required
toolchain, dependencies, deployment configuration or chain access.


## Full stack

### `app:api`

```bash
pnpm app:api
```

Underlying command:

```text
node apps/api/server.mjs
```

### `app:web`

```bash
pnpm app:web
```

Underlying command:

```text
node apps/client/server.mjs
```

### `apps:check`

```bash
pnpm apps:check
```

Underlying command:

```text
node scripts/production/check-fullstack.mjs
```

### `fullstack:check`

```bash
pnpm fullstack:check
```

Underlying command:

```text
node scripts/production/check-fullstack.mjs
```

### `fullstack:dev`

```bash
pnpm fullstack:dev
```

Underlying command:

```text
node scripts/fullstack/start.mjs
```

### `fullstack:runtime-test`

```bash
pnpm fullstack:runtime-test
```

Underlying command:

```text
node scripts/production/test-fullstack-runtime.mjs
```

### `fullstack:start`

```bash
pnpm fullstack:start
```

Underlying command:

```text
node scripts/fullstack/start.mjs
```

### `fullstack:test`

```bash
pnpm fullstack:test
```

Underlying command:

```text
node scripts/production/test-fullstack-live.mjs
```


## Production / CI

### `ci`

```bash
pnpm ci
```

Underlying command:

```text
pnpm production:check && pnpm typecheck && pnpm test
```

### `ci:full`

```bash
pnpm ci:full
```

Underlying command:

```text
pnpm ci && pnpm production:build:solana && pnpm production:build:sui
```

### `ci:solana`

```bash
pnpm ci:solana
```

Underlying command:

```text
pnpm pwrc:toolchain && pnpm program:build && pnpm program:test
```

### `ci:sui`

```bash
pnpm ci:sui
```

Underlying command:

```text
pnpm wpwrc:build
```

### `production:build`

```bash
pnpm production:build
```

Underlying command:

```text
pnpm production:check && pnpm production:build:ts && pnpm production:build:solana && pnpm idl:sync && pnpm production:build:sui
```

### `production:build:solana`

```bash
pnpm production:build:solana
```

Underlying command:

```text
pnpm pwrc:toolchain:solana && anchor build --program-name pwrc_lock && anchor build --program-name pwrc_token
```

### `production:build:sui`

```bash
pnpm production:build:sui
```

Underlying command:

```text
pnpm pwrc:toolchain:sui && sui move build --path contracts/wpwrc && sui move test --path contracts/wpwrc
```

### `production:build:ts`

```bash
pnpm production:build:ts
```

Underlying command:

```text
pnpm pwrc:toolchain:ts && pnpm build:ts && pnpm packages:build
```

### `production:check`

```bash
pnpm production:check
```

Underlying command:

```text
node scripts/production/check-all.mjs
```

### `release:provenance`

```bash
pnpm release:provenance
```

Underlying command:

```text
node scripts/release/generate-provenance.mjs
```

### `release:provenance:verify`

```bash
pnpm release:provenance:verify
```

Underlying command:

```text
node scripts/release/verify-provenance.mjs
```

### `verify`

```bash
pnpm verify
```

Underlying command:

```text
pnpm pwrc:static && pnpm typecheck && pnpm test
```


## Mainnet

### `idl:mainnet:check`

```bash
pnpm idl:mainnet:check
```

Underlying command:

```text
node scripts/idl/check-mainnet-binding.mjs
```

### `mainnet:authorization:consume`

```bash
pnpm mainnet:authorization:consume
```

Underlying command:

```text
node scripts/mainnet/consume-release-authorization.mjs
```

### `mainnet:authorization:payload`

```bash
pnpm mainnet:authorization:payload
```

Underlying command:

```text
node scripts/mainnet/export-signing-payload.mjs
```

### `mainnet:authorization:prepare`

```bash
pnpm mainnet:authorization:prepare
```

Underlying command:

```text
node scripts/mainnet/prepare-release-authorization.mjs
```

### `mainnet:authorization:unused-check`

```bash
pnpm mainnet:authorization:unused-check
```

Underlying command:

```text
node scripts/mainnet/check-release-authorization-unused.mjs
```

### `mainnet:authorization:verify`

```bash
pnpm mainnet:authorization:verify
```

Underlying command:

```text
node scripts/mainnet/verify-release-authorization.mjs
```

### `mainnet:build`

```bash
pnpm mainnet:build
```

Underlying command:

```text
pnpm pwrc:mainnet:prebuild && pnpm production:build
```

### `mainnet:build-manifest`

```bash
pnpm mainnet:build-manifest
```

Underlying command:

```text
node scripts/mainnet/generate-build-manifest.mjs
```

### `mainnet:build-manifest:verify`

```bash
pnpm mainnet:build-manifest:verify
```

Underlying command:

```text
node scripts/mainnet/verify-build-manifest.mjs
```

### `mainnet:evidence:bindings-verify`

```bash
pnpm mainnet:evidence:bindings-verify
```

Underlying command:

```text
node scripts/mainnet/verify-evidence-bindings.mjs
```

### `mainnet:evidence:prepare`

```bash
pnpm mainnet:evidence:prepare
```

Underlying command:

```text
node scripts/mainnet/prepare-evidence.mjs
```

### `mainnet:evidence:verify`

```bash
pnpm mainnet:evidence:verify
```

Underlying command:

```text
node scripts/mainnet/verify-evidence.mjs
```

### `mainnet:preflight:proof`

```bash
pnpm mainnet:preflight:proof
```

Underlying command:

```text
node scripts/mainnet/write-preflight-proof.mjs
```

### `mainnet:release:check`

```bash
pnpm mainnet:release:check
```

Underlying command:

```text
pnpm production:check && pnpm release:provenance:verify && pnpm mainnet:build-manifest:verify && pnpm mainnet:evidence:verify && pnpm mainnet:evidence:bindings-verify && pnpm mainnet:authorization:verify && pnpm mainnet:authorization:unused-check && pnpm pwrc:mainnet:status && pnpm pwrc:mainnet:preflight
```

### `mainnet:static-check`

```bash
pnpm mainnet:static-check
```

Underlying command:

```text
node scripts/production/check-mainnet-release.mjs
```

### `pwrc:burn:mainnet-readiness`

```bash
pnpm pwrc:burn:mainnet-readiness
```

Underlying command:

```text
node scripts/burn/check-mainnet-readiness.mjs
```

### `pwrc:mainnet:deploy`

```bash
pnpm pwrc:mainnet:deploy
```

Underlying command:

```text
PWRC_CLUSTER=mainnet-beta bash scripts/deploy.sh
```

### `pwrc:mainnet:finalize`

```bash
pnpm pwrc:mainnet:finalize
```

Underlying command:

```text
PWRC_CLUSTER=mainnet-beta bash scripts/finalize.sh
```

### `pwrc:mainnet:prebuild`

```bash
pnpm pwrc:mainnet:prebuild
```

Underlying command:

```text
node scripts/mainnet/prebuild.mjs
```

### `pwrc:mainnet:preflight`

```bash
pnpm pwrc:mainnet:preflight
```

Underlying command:

```text
node scripts/mainnet/preflight.mjs
```

### `pwrc:mainnet:prepare`

```bash
pnpm pwrc:mainnet:prepare
```

Underlying command:

```text
PWRC_CLUSTER=mainnet-beta bash scripts/prepare.sh
```

### `pwrc:mainnet:status`

```bash
pnpm pwrc:mainnet:status
```

Underlying command:

```text
node scripts/mainnet/status.mjs
```

### `pwrc:mainnet:verify`

```bash
pnpm pwrc:mainnet:verify
```

Underlying command:

```text
PWRC_CLUSTER=mainnet-beta bash scripts/verify.sh
```

### `pwrc:mainnet:verify-existing`

```bash
pnpm pwrc:mainnet:verify-existing
```

Underlying command:

```text
node scripts/mainnet/verify-existing.mjs
```

### `pwrc:release:mainnet-readiness-v2`

```bash
pnpm pwrc:release:mainnet-readiness-v2
```

Underlying command:

```text
node scripts/release/check-mainnet-readiness-v2.mjs
```

### `test:mainnet-release-state`

```bash
pnpm test:mainnet-release-state
```

Underlying command:

```text
node --import tsx --test tests/mainnet-release-state.test.ts
```

### `wpwrc:mainnet:deploy`

```bash
pnpm wpwrc:mainnet:deploy
```

Underlying command:

```text
bash scripts/sui/deploy-mainnet.sh
```

### `wpwrc:mainnet:readiness`

```bash
pnpm wpwrc:mainnet:readiness
```

Underlying command:

```text
node scripts/sui/check-production-readiness.mjs mainnet
```

### `wpwrc:update-config:mainnet`

```bash
pnpm wpwrc:update-config:mainnet
```

Underlying command:

```text
node scripts/sui/update-wpwrc-config.mjs mainnet
```


## Devnet

### `devnet:build`

```bash
pnpm devnet:build
```

Underlying command:

```text
pnpm pwrc:devnet:prebuild && pnpm production:build
```

### `pwrc:devnet:deploy`

```bash
pnpm pwrc:devnet:deploy
```

Underlying command:

```text
PWRC_CLUSTER=devnet bash scripts/deploy.sh
```

### `pwrc:devnet:finalize`

```bash
pnpm pwrc:devnet:finalize
```

Underlying command:

```text
PWRC_CLUSTER=devnet bash scripts/finalize.sh
```

### `pwrc:devnet:prebuild`

```bash
pnpm pwrc:devnet:prebuild
```

Underlying command:

```text
node scripts/devnet/prebuild.mjs
```

### `pwrc:devnet:preflight`

```bash
pnpm pwrc:devnet:preflight
```

Underlying command:

```text
node scripts/devnet/preflight.mjs
```

### `pwrc:devnet:prepare`

```bash
pnpm pwrc:devnet:prepare
```

Underlying command:

```text
PWRC_CLUSTER=devnet bash scripts/prepare.sh
```

### `pwrc:devnet:status`

```bash
pnpm pwrc:devnet:status
```

Underlying command:

```text
node scripts/devnet/status.mjs
```

### `pwrc:devnet:verify`

```bash
pnpm pwrc:devnet:verify
```

Underlying command:

```text
PWRC_CLUSTER=devnet bash scripts/verify.sh
```


## IDL / ABI

### `idl:attestation`

```bash
pnpm idl:attestation
```

Underlying command:

```text
node scripts/release/generate-idl-attestation.mjs
```

### `idl:attestation:verify`

```bash
pnpm idl:attestation:verify
```

Underlying command:

```text
node scripts/release/verify-idl-attestation.mjs
```

### `idl:baseline:check`

```bash
pnpm idl:baseline:check
```

Underlying command:

```text
node scripts/idl/check-baseline.mjs
```

### `idl:bindings:check`

```bash
pnpm idl:bindings:check
```

Underlying command:

```text
node scripts/idl/check-bindings.mjs
```

### `idl:build`

```bash
pnpm idl:build
```

Underlying command:

```text
node scripts/idl/build.mjs
```

### `idl:check`

```bash
pnpm idl:check
```

Underlying command:

```text
node scripts/idl/check.mjs
```

### `idl:check-all`

```bash
pnpm idl:check-all
```

Underlying command:

```text
node scripts/idl/check-all.mjs && node scripts/idl/check-baseline.mjs && node scripts/idl/check-program-id.mjs && node scripts/idl/classify-change.mjs && node scripts/idl/check-bindings.mjs && node scripts/idl/check-mainnet-binding.mjs && node scripts/release/verify-idl-attestation.mjs
```

### `idl:classify`

```bash
pnpm idl:classify
```

Underlying command:

```text
node scripts/idl/classify-change.mjs
```

### `idl:compatibility`

```bash
pnpm idl:compatibility
```

Underlying command:

```text
node scripts/idl/compatibility.mjs
```

### `idl:discriminators`

```bash
pnpm idl:discriminators
```

Underlying command:

```text
node scripts/idl/check-discriminators.mjs
```

### `idl:drift-check`

```bash
pnpm idl:drift-check
```

Underlying command:

```text
node scripts/idl/source-drift.mjs
```

### `idl:fingerprint`

```bash
pnpm idl:fingerprint
```

Underlying command:

```text
node scripts/idl/fingerprint.mjs
```

### `idl:generated:verify`

```bash
pnpm idl:generated:verify
```

Underlying command:

```text
node scripts/idl/verify-generated.mjs
```

### `idl:hash`

```bash
pnpm idl:hash
```

Underlying command:

```text
node scripts/idl/hash.mjs
```

### `idl:program-id:check`

```bash
pnpm idl:program-id:check
```

Underlying command:

```text
node scripts/idl/check-program-id.mjs
```

### `idl:readiness`

```bash
pnpm idl:readiness
```

Underlying command:

```text
node scripts/idl/readiness.mjs
```

### `idl:release`

```bash
pnpm idl:release
```

Underlying command:

```text
node scripts/idl/release-manifest.mjs
```

### `idl:sui-normalized`

```bash
pnpm idl:sui-normalized
```

Underlying command:

```text
node scripts/idl/sui-normalized-check.mjs
```

### `idl:sync`

```bash
pnpm idl:sync
```

Underlying command:

```text
node scripts/idl/sync.mjs
```

### `idl:token:check`

```bash
pnpm idl:token:check
```

Underlying command:

```text
node scripts/idl/check-token-program.mjs
```

### `pwrc:idl:check`

```bash
pnpm pwrc:idl:check
```

Underlying command:

```text
node scripts/idl/check-all.mjs
```


## Token / programs

### `program:build`

```bash
pnpm program:build
```

Underlying command:

```text
anchor build --program-name pwrc_lock
```

### `program:id`

```bash
pnpm program:id
```

Underlying command:

```text
anchor keys list
```

### `program:test`

```bash
pnpm program:test
```

Underlying command:

```text
cargo test -p pwrc-lock
```

### `pwrc:program:static`

```bash
pnpm pwrc:program:static
```

Underlying command:

```text
node scripts/check-program-static.mjs
```

### `pwrc:programs:check`

```bash
pnpm pwrc:programs:check
```

Underlying command:

```text
node scripts/security/check-programs.mjs
```

### `pwrc:solana:program-check`

```bash
pnpm pwrc:solana:program-check
```

Underlying command:

```text
node scripts/production/check-solana-program.mjs
```

### `token:build`

```bash
pnpm token:build
```

Underlying command:

```text
anchor build --program-name pwrc_token
```

### `token:check`

```bash
pnpm token:check
```

Underlying command:

```text
node scripts/token/check-program.mjs
```

### `token:manifest:check`

```bash
pnpm token:manifest:check
```

Underlying command:

```text
node scripts/token/check-manifest.mjs
```

### `token:metadata:check`

```bash
pnpm token:metadata:check
```

Underlying command:

```text
node scripts/metadata/validate-token-metadata.mjs
```

### `token:production:check`

```bash
pnpm token:production:check
```

Underlying command:

```text
node scripts/token/check-program.mjs && node scripts/token/check-manifest.mjs && node scripts/security/check-transfer-fee.mjs && node scripts/metadata/validate-token-metadata.mjs && node scripts/metadata/check-assets.mjs && node scripts/idl/check-token-program.mjs
```

### `token:readiness`

```bash
pnpm token:readiness
```

Underlying command:

```text
node scripts/token/readiness.mjs
```

### `token:test`

```bash
pnpm token:test
```

Underlying command:

```text
cargo test -p pwrc-token
```


## Sui / wPWRC

### `pwrc:sui:bridge`

```bash
pnpm pwrc:sui:bridge
```

Underlying command:

```text
tsx scripts/check-sui-bridge.ts
```

### `pwrc:sui:capability-check`

```bash
pnpm pwrc:sui:capability-check
```

Underlying command:

```text
node scripts/production/check-sui-capability.mjs
```

### `pwrc:sui:identity`

```bash
pnpm pwrc:sui:identity
```

Underlying command:

```text
bash scripts/sui/use-powerchain.sh
```

### `pwrc:sui:networks`

```bash
pnpm pwrc:sui:networks
```

Underlying command:

```text
node scripts/sui/check-networks.mjs
```

### `wpwrc:build`

```bash
pnpm wpwrc:build
```

Underlying command:

```text
bash scripts/sui/build.sh
```

### `wpwrc:finalize-registration`

```bash
pnpm wpwrc:finalize-registration
```

Underlying command:

```text
bash scripts/sui/finalize-registration.sh
```

### `wpwrc:manifest`

```bash
pnpm wpwrc:manifest
```

Underlying command:

```text
node scripts/sui/write-deployment-manifest.mjs
```

### `wpwrc:testnet:deploy`

```bash
pnpm wpwrc:testnet:deploy
```

Underlying command:

```text
bash scripts/sui/deploy-testnet.sh
```

### `wpwrc:testnet:readiness`

```bash
pnpm wpwrc:testnet:readiness
```

Underlying command:

```text
node scripts/sui/check-production-readiness.mjs testnet
```

### `wpwrc:update-config:testnet`

```bash
pnpm wpwrc:update-config:testnet
```

Underlying command:

```text
node scripts/sui/update-wpwrc-config.mjs testnet
```

### `wpwrc:zero-genesis`

```bash
pnpm wpwrc:zero-genesis
```

Underlying command:

```text
node scripts/sui/check-zero-genesis.mjs
```


## Bridge / relayer

### `pwrc:bridge`

```bash
pnpm pwrc:bridge
```

Underlying command:

```text
tsx scripts/check-bridge.ts
```

### `pwrc:bridge:intent-check`

```bash
pnpm pwrc:bridge:intent-check
```

Underlying command:

```text
node scripts/security/check-bridge-intent.mjs
```

### `pwrc:bridge:release-check`

```bash
pnpm pwrc:bridge:release-check
```

Underlying command:

```text
node scripts/release/check-bridge-release.mjs
```

### `pwrc:bridge:upgrade-check`

```bash
pnpm pwrc:bridge:upgrade-check
```

Underlying command:

```text
node scripts/bridge/check-upgrade.mjs
```

### `pwrc:client:bridge-check`

```bash
pnpm pwrc:client:bridge-check
```

Underlying command:

```text
node scripts/production/check-client-bridge.mjs
```

### `pwrc:relayer:check`

```bash
pnpm pwrc:relayer:check
```

Underlying command:

```text
node scripts/relayer/check.mjs
```

### `pwrc:relayer:durability-check`

```bash
pnpm pwrc:relayer:durability-check
```

Underlying command:

```text
node scripts/production/check-relayer-durability.mjs
```

### `test:relayer-durability`

```bash
pnpm test:relayer-durability
```

Underlying command:

```text
node --import tsx --test tests/relayer-durability.test.ts tests/url-hardening.test.ts
```


## Security / runtime

### `pwrc:config:registry-check`

```bash
pnpm pwrc:config:registry-check
```

Underlying command:

```text
node scripts/production/check-config-registry.mjs
```

### `pwrc:doctor`

```bash
pnpm pwrc:doctor
```

Underlying command:

```text
bash scripts/doctor.sh
```

### `pwrc:doctor:portability-check`

```bash
pnpm pwrc:doctor:portability-check
```

Underlying command:

```text
node scripts/production/check-doctor-portability.mjs
```

### `pwrc:root:check`

```bash
pnpm pwrc:root:check
```

Underlying command:

```text
node scripts/production/check-root-utils.mjs
```

### `pwrc:root:map`

```bash
pnpm pwrc:root:map
```

Underlying command:

```text
node scripts/maintenance/root-map.mjs
```

### `pwrc:root:platform-check`

```bash
pnpm pwrc:root:platform-check
```

Underlying command:

```text
node scripts/production/check-root-platform.mjs
```

### `pwrc:runtime:check`

```bash
pnpm pwrc:runtime:check
```

Underlying command:

```text
node scripts/production/check-runtime-config.mjs
```

### `pwrc:runtime:hardening-check`

```bash
pnpm pwrc:runtime:hardening-check
```

Underlying command:

```text
node scripts/production/check-runtime-hardening.mjs
```

### `pwrc:security:check`

```bash
pnpm pwrc:security:check
```

Underlying command:

```text
node scripts/security/check-model.mjs
```

### `pwrc:security:hardening-check`

```bash
pnpm pwrc:security:hardening-check
```

Underlying command:

```text
node scripts/production/check-security-hardening.mjs
```

### `pwrc:toolchain`

```bash
pnpm pwrc:toolchain
```

Underlying command:

```text
node scripts/check-toolchain.mjs
```

### `pwrc:toolchain:production`

```bash
pnpm pwrc:toolchain:production
```

Underlying command:

```text
node scripts/toolchain/check-production.mjs all
```

### `pwrc:toolchain:solana`

```bash
pnpm pwrc:toolchain:solana
```

Underlying command:

```text
node scripts/toolchain/check-production.mjs solana
```

### `pwrc:toolchain:sui`

```bash
pnpm pwrc:toolchain:sui
```

Underlying command:

```text
node scripts/toolchain/check-production.mjs sui
```

### `pwrc:toolchain:ts`

```bash
pnpm pwrc:toolchain:ts
```

Underlying command:

```text
node scripts/toolchain/check-production.mjs ts
```

### `pwrc:utils:duplication-check`

```bash
pnpm pwrc:utils:duplication-check
```

Underlying command:

```text
node scripts/production/check-utility-duplication.mjs
```

### `test:root-security`

```bash
pnpm test:root-security
```

Underlying command:

```text
node scripts/production/test-root-security.mjs
```

### `test:runtime-hardening`

```bash
pnpm test:runtime-hardening
```

Underlying command:

```text
node --import tsx --test tests/runtime-hardening.test.ts
```

### `toolchain:node-pnpm`

```bash
pnpm toolchain:node-pnpm
```

Underlying command:

```text
node scripts/toolchain/check-node-pnpm.mjs
```


## Packages / TypeScript

### `packages:build`

```bash
pnpm packages:build
```

Underlying command:

```text
pnpm -r --if-present build
```

### `packages:check`

```bash
pnpm packages:check
```

Underlying command:

```text
pnpm -r --if-present check
```

### `packages:clean`

```bash
pnpm packages:clean
```

Underlying command:

```text
pnpm -r --if-present clean
```

### `pnpm:approve-builds`

```bash
pnpm pnpm:approve-builds
```

Underlying command:

```text
pnpm approve-builds
```

### `pnpm:check`

```bash
pnpm pnpm:check
```

Underlying command:

```text
node scripts/packages/check-pnpm-build-policy.mjs
```

### `pnpm:ignored-builds`

```bash
pnpm pnpm:ignored-builds
```

Underlying command:

```text
pnpm ignored-builds
```

### `pwrc:config:check`

```bash
pnpm pwrc:config:check
```

Underlying command:

```text
node scripts/packages/check-tsconfig.mjs
```

### `pwrc:exports:check`

```bash
pnpm pwrc:exports:check
```

Underlying command:

```text
node scripts/packages/check-exports.mjs
```

### `pwrc:packages:check`

```bash
pnpm pwrc:packages:check
```

Underlying command:

```text
node scripts/packages/check-workspace.mjs
```

### `pwrc:scripts:check`

```bash
pnpm pwrc:scripts:check
```

Underlying command:

```text
node scripts/packages/check-scripts.mjs
```

### `typecheck`

```bash
pnpm typecheck
```

Underlying command:

```text
tsc -p tsconfig.json --noEmit
```

### `typecheck:build`

```bash
pnpm typecheck:build
```

Underlying command:

```text
tsc -p tsconfig.build.json --noEmit
```

### `typecheck:scripts`

```bash
pnpm typecheck:scripts
```

Underlying command:

```text
tsc -p tsconfig.scripts.json --noEmit
```

### `typecheck:tests`

```bash
pnpm typecheck:tests
```

Underlying command:

```text
tsc -p tsconfig.tests.json --noEmit
```


## Metadata / operations

### `pwrc:burn:check`

```bash
pnpm pwrc:burn:check
```

Underlying command:

```text
node scripts/burn/check-quarterly.mjs
```

### `pwrc:burn:epoch-check`

```bash
pnpm pwrc:burn:epoch-check
```

Underlying command:

```text
node scripts/burn/check-epoch.mjs
```

### `pwrc:burn:race-check`

```bash
pnpm pwrc:burn:race-check
```

Underlying command:

```text
node scripts/burn/check-race-protection.mjs
```

### `pwrc:burn:runbook`

```bash
pnpm pwrc:burn:runbook
```

Underlying command:

```text
node scripts/burn/check-quarterly.mjs
```

### `pwrc:journal`

```bash
pnpm pwrc:journal
```

Underlying command:

```text
node scripts/verify-journal.mjs deployments/${PWRC_CLUSTER:-devnet}/journal.jsonl
```

### `pwrc:market`

```bash
pnpm pwrc:market
```

Underlying command:

```text
tsx scripts/check-market.ts
```

### `pwrc:metadata`

```bash
pnpm pwrc:metadata
```

Underlying command:

```text
tsx scripts/check-metadata.ts
```

### `pwrc:metadata:assets-check`

```bash
pnpm pwrc:metadata:assets-check
```

Underlying command:

```text
node scripts/metadata/check-assets.mjs
```

### `pwrc:metadata:links-check`

```bash
pnpm pwrc:metadata:links-check
```

Underlying command:

```text
node scripts/metadata/check-official-links.mjs
```

### `pwrc:metadata:manifest-check`

```bash
pnpm pwrc:metadata:manifest-check
```

Underlying command:

```text
node scripts/metadata/check-manifest.mjs
```

### `pwrc:metadata:validate`

```bash
pnpm pwrc:metadata:validate
```

Underlying command:

```text
node scripts/metadata/validate-token-metadata.mjs
```

### `pwrc:operations`

```bash
pnpm pwrc:operations
```

Underlying command:

```text
tsx scripts/check-operations.ts
```

### `pwrc:operations:runbook-check`

```bash
pnpm pwrc:operations:runbook-check
```

Underlying command:

```text
node scripts/operations/check-runbook.mjs
```

### `pwrc:snapshot`

```bash
pnpm pwrc:snapshot
```

Underlying command:

```text
bash scripts/snapshot.sh
```

### `pwrc:status`

```bash
pnpm pwrc:status
```

Underlying command:

```text
bash scripts/status.sh
```


## Tests

### `test`

```bash
pnpm test
```

Underlying command:

```text
node --import tsx --test tests/*.test.ts
```

### `test:anchor`

```bash
pnpm test:anchor
```

Underlying command:

```text
node --import tsx --test tests/anchor.test.ts
```


## Other

### `build:ts`

```bash
pnpm build:ts
```

Underlying command:

```text
tsc -p tsconfig.build.json
```

### `check`

```bash
pnpm check
```

Underlying command:

```text
pnpm typecheck
```

### `clean:cache`

```bash
pnpm clean:cache
```

Underlying command:

```text
node scripts/maintenance/clean-cache.mjs
```

### `clean:ts`

```bash
pnpm clean:ts
```

Underlying command:

```text
node -e "require('node:fs').rmSync('dist',{recursive:true,force:true})"
```

### `pwrc:client:check`

```bash
pnpm pwrc:client:check
```

Underlying command:

```text
node scripts/native-token-client/check-v2.mjs
```

### `pwrc:client:test`

```bash
pnpm pwrc:client:test
```

Underlying command:

```text
node --import tsx --test tests/anchor.test.ts
```

### `pwrc:fees`

```bash
pnpm pwrc:fees
```

Underlying command:

```text
node scripts/security/check-transfer-fee.mjs
```

### `pwrc:handlers:check`

```bash
pnpm pwrc:handlers:check
```

Underlying command:

```text
node scripts/production/check-handlers.mjs
```

### `pwrc:integration:check`

```bash
pnpm pwrc:integration:check
```

Underlying command:

```text
node scripts/integration/check.mjs
```

### `pwrc:integrations`

```bash
pnpm pwrc:integrations
```

Underlying command:

```text
tsx scripts/check-integrations.ts
```

### `pwrc:lockfile`

```bash
pnpm pwrc:lockfile
```

Underlying command:

```text
node scripts/check-lockfile.mjs
```

### `pwrc:maintenance:duplicates`

```bash
pnpm pwrc:maintenance:duplicates
```

Underlying command:

```text
node scripts/maintenance/check-duplicates.mjs
```

### `pwrc:manifests:check`

```bash
pnpm pwrc:manifests:check
```

Underlying command:

```text
node scripts/security/check-manifests.mjs
```

### `pwrc:native-client:check`

```bash
pnpm pwrc:native-client:check
```

Underlying command:

```text
node scripts/native-token-client/check.mjs
```

### `pwrc:next:check`

```bash
pnpm pwrc:next:check
```

Underlying command:

```text
node --check next.config.mjs
```

### `pwrc:optimization:check`

```bash
pnpm pwrc:optimization:check
```

Underlying command:

```text
node scripts/optimization/check.mjs
```

### `pwrc:optimization:v2-check`

```bash
pnpm pwrc:optimization:v2-check
```

Underlying command:

```text
node scripts/optimization/check-v2.mjs
```

### `pwrc:policy`

```bash
pnpm pwrc:policy
```

Underlying command:

```text
tsx scripts/check-policy.ts
```

### `pwrc:production:check`

```bash
pnpm pwrc:production:check
```

Underlying command:

```text
node scripts/production/check-all.mjs
```

### `pwrc:proof`

```bash
pnpm pwrc:proof
```

Underlying command:

```text
tsx scripts/proof.ts
```

### `pwrc:readiness`

```bash
pnpm pwrc:readiness
```

Underlying command:

```text
tsx scripts/check-readiness.ts
```

### `pwrc:release`

```bash
pnpm pwrc:release
```

Underlying command:

```text
tsx scripts/release.ts
```

### `pwrc:release:provenance`

```bash
pnpm pwrc:release:provenance
```

Underlying command:

```text
node scripts/release/generate-provenance.mjs
```

### `pwrc:seal`

```bash
pnpm pwrc:seal
```

Underlying command:

```text
node scripts/seal-inputs.mjs
```

### `pwrc:stale-model:check`

```bash
pnpm pwrc:stale-model:check
```

Underlying command:

```text
node scripts/production/check-stale-model.mjs
```

### `pwrc:static`

```bash
pnpm pwrc:static
```

Underlying command:

```text
pnpm pwrc:versions && pnpm pwrc:policy && pnpm pwrc:metadata:validate && pnpm pwrc:wpwrc:spec-check && pnpm pwrc:bridge:intent-check && pnpm pwrc:fees && pnpm pwrc:manifests:check && pnpm pwrc:sui:networks && pnpm pwrc:runtime:check && pnpm pwrc:transactions:check && pnpm pwrc:handlers:check && pnpm pwrc:config:check && pnpm pwrc:packages:check && pnpm pwrc:scripts:check && pnpm pwrc:exports:check
```

### `pwrc:token:verify-state`

```bash
pnpm pwrc:token:verify-state
```

Underlying command:

```text
node scripts/token/verify-mint-state.mjs
```

### `pwrc:transactions:check`

```bash
pnpm pwrc:transactions:check
```

Underlying command:

```text
node scripts/production/check-transactions.mjs
```

### `pwrc:typescript:regression-check`

```bash
pnpm pwrc:typescript:regression-check
```

Underlying command:

```text
node scripts/production/check-typescript-regressions.mjs
```

### `pwrc:versions`

```bash
pnpm pwrc:versions
```

Underlying command:

```text
tsx scripts/check-version.ts
```

### `pwrc:wpwrc:spec-check`

```bash
pnpm pwrc:wpwrc:spec-check
```

Underlying command:

```text
node scripts/security/check-wpwrc-spec.mjs
```

### `setup:pnpm`

```bash
pnpm setup:pnpm
```

Underlying command:

```text
node scripts/setup-pnpm.mjs
```

### `telemetry:check`

```bash
pnpm telemetry:check
```

Underlying command:

```text
node scripts/telemetry/check-disabled.mjs
```


### `platform:inspect-shell`

```bash
pnpm platform:inspect-shell
```

Inspects PATH and shell startup files for stale hard-coded Node runtime entries.
When Node itself cannot start, run the underlying native command directly:

```bash
bash scripts/bootstrap/inspect-shell.sh
```

### Sourceable Node activation

This is intentionally **not** a pnpm script because pnpm cannot run while Node
is broken:

```bash
source scripts/bootstrap/activate-node.sh
```

It switches the current shell to the repository Node compatibility baseline and
repairs Corepack/pnpm after verifying Node can start.

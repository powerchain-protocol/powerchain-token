# PowerChain Generated Reports

Version `1.0.0`.

`reports/` contains generated validation/readiness outputs for the current
source tree. Reports are evidence of the checks actually executed; they are not
a substitute for missing chain builds or deployments.

Key files:

- `production-static-validation.json` — unified static source/config checks.
- `production-upgrade-status.json` — consolidated build/toolchain/readiness state.
- `devnet-prebuild.json` / `devnet-status.json` — Devnet phases and blockers.
- `mainnet-prebuild.json` / `mainnet-status.json` — Mainnet phases and blockers.
- `token-readiness.json` — canonical PWRC on-chain evidence blockers.
- `idl-source-drift.json`, `idl-compatibility.json`, `idl-readiness.json` — ABI/IDL state.
- `bridge-release-readiness.json` — bridge configuration release state.
- `release-provenance.json` — generated source provenance.
- `cache-clean.json` — cache cleanup result.

Missing generated Anchor IDLs, normalized Sui modules, `pnpm-lock.yaml`, Sui
`Move.lock`, deployment identities, or authority evidence remain explicit
blocked states and must never be synthesized by report generation.

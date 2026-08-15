# PowerChain Sui Contracts

**Canonical release:** `1.0.0`

`contracts/wpwrc` contains the Sui wrapped-token controller for **Wrapped
PowerChain (wPWRC)**.

```text
Name                         Wrapped PowerChain
Symbol                       wPWRC
Decimals                     9
Genesis wrapped supply       0
Base-unit ratio              1:1 with canonical PWRC
Maximum wrapped exposure     18,446,000,000 PWRC-equivalent
```

## Controller model

`BridgeController` owns the wPWRC `TreasuryCap` and starts paused.

Roles:

- **governor** — administration, operator changes and pause policy;
- **operator** — authorized Solana→Sui bridge-mint execution;
- **users** — may burn owned wPWRC for a Solana release request.

Security properties include:

- replay protection using unique 32-byte Solana source-message digests;
- zero digest/recipient rejection;
- fixed maximum wrapped exposure;
- overflow-safe sequence/supply handling;
- two-step governor transfer;
- governor/operator role separation;
- forced pause after governor acceptance.

`mint_from_solana` remains operator-gated and replay protected.
`burn_for_solana` burns wPWRC before any canonical Solana release can be
considered.

## Deployment identity

`wpwrc = "0x0"` in `Move.toml` is a source placeholder, not a package ID.

A Mainnet deployment claim requires real evidence for at least:

```text
package ID
coin type
BridgeController object ID
metadata object/capability identity
publish transaction
checkpoint
independent RPC verification
```

The configured `powerchain` Sui address is an alias/configuration value and is
not treated as a published package ID.

## Build

When the Sui CLI/toolchain is available:

```bash
sui move build --path contracts/wpwrc
```

Devnet publish tooling is separately gated. Mainnet publication requires
explicit release authorization and evidence.

Source/static checks do not prove Move compilation or publication.

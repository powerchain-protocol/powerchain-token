# Wrapped PowerChain (wPWRC) on Sui

PWRC remains canonical on Solana. `wPWRC` is the Sui representation.

## Monetary invariants

- canonical asset: PWRC / Solana Token-2022
- wrapped asset: wPWRC / Sui
- decimals: 9 on both networks
- Sui genesis supply: 0
- absolute wrapped ceiling: 18,446,000,000 PWRC-equivalent
- mint amount: must be > 0
- burn amount: must be > 0
- normal wPWRC transfers are unrestricted
- bridge pause only pauses mint/burn bridge operations

## Sui standard

The Move package uses the Sui Currency/Coin Registry standard with an OTW.
Metadata is deleted/locked at initialization so the wPWRC name, symbol and
icon cannot later be redirected.

The TreasuryCap is encapsulated inside `BridgeController`; it is never returned
by a public function.

## Bridge logic

Solana -> Sui:

1. lock canonical PWRC on Solana;
2. wait for the required Solana finality policy;
3. derive a 32-byte source-message hash;
4. bridge verifier/authority validates the lock;
5. call `mint_from_bridge`;
6. the Move package rejects replayed message hashes;
7. mint wPWRC to the Sui recipient.

Sui -> Solana:

1. user calls `burn_for_bridge`;
2. wPWRC is destroyed on Sui;
3. a `BridgeBurned` event commits amount and destination;
4. bridge verifier observes/finalizes the Sui burn;
5. canonical PWRC is released on Solana.

## Security boundary

The included controller is an operator-attested bridge controller. It is
deployable for Testnet qualification, but a production Mainnet launch should
put the bridge authority behind an audited threshold/multisig or replace the
authorization path with an audited bridge verifier.

Do not treat possession of a single hot key as production bridge security.

## Build

```bash
cd contracts/wpwrc
sui move build
sui move test
```

Current Sui packages use Move edition `2024`.

## Testnet

```bash
sui client switch --env testnet
sui client switch --address powerchain
bash scripts/sui/deploy-testnet.sh
```

OTW-created currencies require a second
`0x2::coin_registry::finalize_registration` transaction after publication.
Preserve the publish JSON, identify the created Currency object, finalize it,
then record package ID, coin type, currency ID and BridgeController ID in
`config/sui/wpwrc.json`.

## Mainnet

Mainnet must remain gated until:

- Sui Testnet build/tests pass;
- Solana canonical mint is verified;
- bridge authority is production custody/multisig or audited verifier;
- replay/finality tests pass both directions;
- conservation monitoring proves `wrapped <= locked canonical`;
- package and source commitments are signed and archived.

## Hardened claim identity

A Solana -> Sui mint claim is now domain-separated and commits to all
mint-critical values:

```text
source chain
source cluster
canonical PWRC mint
Solana lock vault
Solana transaction signature
instruction index
locked amount
Sui recipient
```

Changing any field changes the 32-byte claim hash. The Move package records that
hash and rejects replay.

## Registration helper

OTW Currency registration is a two-transaction flow. After publication:

```bash
bash scripts/sui/finalize-registration.sh   testnet   <PACKAGE_ID>   <CURRENCY_OBJECT_ID>
```

The helper checks the active Sui environment before calling:

```text
0x2::coin_registry::finalize_registration<PACKAGE::wpwrc::WPWRC>
```

against the Coin Registry object at `0xc`.

## Deployment evidence

After registration, write an immutable deployment identity manifest:

```bash
node scripts/sui/write-deployment-manifest.mjs   testnet   <PACKAGE_ID>   <BRIDGE_CONTROLLER_ID>   <CURRENCY_OBJECT_ID>
```

The manifest records the canonical coin type and a SHA-256 commitment.

## Conservation monitoring

Production monitoring must bind both chain positions:

```text
Solana slot
Sui checkpoint
PWRC locked
wPWRC live supply
pending Solana -> Sui
pending Sui -> Solana
observation time
SHA-256 evidence
```

The invariant remains:

```text
wPWRC live supply
+ pending Solana -> Sui
+ pending Sui -> Solana
<= canonical PWRC locked on Solana
```

Authority rotation is now permitted only while bridge operations are paused.
The current authority can also cancel a pending rotation while paused.

## Operator / governor separation

The controller now has two independent security roles:

```text
operator
  └─ execute already-verified Solana -> Sui mint claims

governor
  ├─ pause / unpause bridge operations
  ├─ propose / cancel operator rotation
  └─ propose / cancel governor rotation
```

Role changes require the bridge to be paused and use a two-step
propose/accept flow. For Mainnet, operator and governor must be different
controlled identities. The governor should use stronger multisig/threshold
custody than the online operator.

## Event sequencing

Mint and burn events contain monotonic sequence numbers in addition to their
replay IDs and `supply_after`. Indexers should reject gaps, duplicates and
unexpected sequence regressions when producing bridge accounting evidence.

## Mint authorization envelope

The off-chain verifier should issue a short-lived authorization only after the
canonical Solana lock has satisfied the configured finality policy.

Authorization fields include:

- claim hash
- Solana slot
- source signature
- instruction index
- canonical mint
- lock vault
- exact base-unit amount
- Sui recipient
- observation time
- expiry
- verifier identity

The default maximum authorization lifetime is 10 minutes.

## Deployment lifecycle

A deployment is not considered active merely because the package published.

```text
NOT_DEPLOYED
→ PUBLISHED
→ REGISTERED
→ IDENTITY_VERIFIED
→ CONSERVATION_VERIFIED
→ ACTIVE
```

`PAUSED` and `BLOCKED` are explicit operational states.

Check readiness with:

```bash
pnpm wpwrc:testnet:readiness
pnpm wpwrc:mainnet:readiness
```

Mainnet readiness additionally requires distinct operator/governor identities,
the canonical Solana lock vault and a bridge-verifier identity.

## Quarterly canonical-supply ceiling

The Sui BridgeController now has a monotonically decreasing
`canonical_supply_ceiling`. It begins at the PWRC genesis maximum and is lowered
after finalized canonical Solana burns. It can never be raised by governance.

Configured Testnet PowerChain identity:

```text
alias:   powerchain
address: 0x4a4a81c5e4a520c1b4d7b5b572a0567f48c6c7e85257f0a13e65639cfba49fb1
```

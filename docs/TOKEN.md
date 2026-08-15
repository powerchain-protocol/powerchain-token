# PowerChain PWRC Token

PowerChain uses one canonical token release identity: **PWRC 1.0.0**.

## Canonical native asset

```text
Name                  PowerChain
Symbol                PWRC
Chain                 Solana
Network               mainnet-beta
Standard              Token-2022
Mint                  PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc
Decimals              9
Fixed supply          18,446,000,000 PWRC
Fixed supply units    18,446,000,000,000,000,000
u64 headroom          744,073,709,551,615 base units
Mint authority        revoked after genesis
Freeze authority      disabled
```

Required Token-2022 extensions are exactly:

```text
TransferFeeConfig
MetadataPointer
TokenMetadata
```

No other mint extensions are accepted by the canonical runtime profile.

## Native transfer fee

```text
Basis points                 250
Percent                      2.5%
Maximum fee                  1,000,000 PWRC
Maximum fee base units       1,000,000,000,000,000
Canonical cap threshold      40,000,000 PWRC gross
Threshold base units         40,000,000,000,000,000
Rounding                     ceil
```

Because integer fee math rounds upward, a value immediately below the nominal
40,000,000 PWRC threshold can round to the same maximum fee. The runtime
therefore distinguishes:

- `feeAtMaximum`: calculated fee equals the maximum fee;
- `feeCapped`: gross amount has reached the canonical cap threshold.

This keeps the configured economic threshold stable while preserving exact
Token-2022 integer rounding.

## Metadata

Canonical metadata:

```text
https://token.powerchain.energy/metadata/metadata.json
```

Canonical image:

```text
https://token.powerchain.energy/assets/tokens/pwrc-logo.png
```

The Token-2022 metadata pointer is self-referential to the PWRC mint. Metaplex
metadata support is compatibility/read tooling and does not replace the
Token-2022 `MetadataPointer` + `TokenMetadata` identity.

## Wrapped PowerChain

The Sui representation is **Wrapped PowerChain (wPWRC)**:

```text
Decimals                         9
Genesis wrapped supply           0
Maximum wrapped supply           18,446,000,000 PWRC-equivalent
Backing ratio                    1:1 in base units
Supply model                     mint on verified lock
                                 burn before canonical release
```

wPWRC metadata:

```text
https://token.powerchain.energy/metadata/wpwrc.json
```

wPWRC image:

```text
https://token.powerchain.energy/assets/tokens/wpwrc.png
```

## Canonical policy commitment

The complete PWRC + wPWRC economic/identity policy is committed under:

```text
POWERCHAIN_PWRC_TOKEN_POLICY_V1
```

SHA-256:

```text
cfaac8d0c647bf3e62da51996f07a3c96e6445697bdedbe56d38a0318fb353d4
```

Source/config:

```text
config/token-policy.json
packages/protocol/src/token-policy.ts
```

Validate with:

```bash
pnpm token:policy:check
pnpm token:policy:test:source
pnpm native-token:check
pnpm metadata:check
```

## Amount handling

PWRC token amounts must not be converted through JavaScript floating point.
Use the exact protocol utilities:

```text
parsePwrcTokensToBaseUnits()
formatPwrcBaseUnits()
assertCanonicalPwrcBaseUnitsString()
```

They enforce 9-decimal precision, canonical integer encoding and the fixed
supply ceiling.


## Canonical token API

The API exposes the complete canonical PWRC/wPWRC policy at:

```text
GET /api/v1/token/policy
```

The response is loaded from the committed `config/token-policy.json` policy
document and verifies its SHA-256 commitment before serving it.

The older native-only route remains available for compatibility:

```text
GET /api/v1/token/native-policy
```

It is now derived from the same canonical policy document, so API/native policy
fields cannot independently drift from the PWRC/wPWRC release policy.

SDK consumers can use:

```ts
import {
  parsePwrcTokensToBaseUnits,
  formatPwrcBaseUnits,
  nativePwrcTransferFee,
  PWRC_TOKEN_POLICY,
} from "@powerchain/sdk/token";
```

The SDK facade delegates to `@powerchain/protocol`; it does not duplicate token
math or policy constants.


## Runtime policy derivation

API fee calculation and bridge identity no longer carry independent copies of
PWRC economics. They derive fixed supply, transfer fee, fee cap and canonical
asset identity from the verified `config/token-policy.json` document.

This means API quote amounts are now rejected when they exceed the actual fixed
PWRC supply, rather than merely checking the Solana `u64` ceiling. Gross-up
calculations are also bounded by the fixed supply and fail explicitly when the
requested post-fee net amount is unreachable.

The compact `GET /api/v1/token` response is generated from the same canonical
policy and includes the policy SHA-256, native fee-cap base units and canonical
fee-cap threshold.

SDK bridge amount validation reuses protocol amount validation, so client-side
requests also reject zero, malformed and above-supply PWRC base-unit values.

Validate with:

```bash
pnpm token:runtime:parity:check
pnpm token:runtime:parity:test:source
```


## Policy-bound quotes and transfer intents

Every canonical PWRC fee quote and native transfer intent now includes the
canonical token policy SHA-256:

```text
cfaac8d0c647bf3e62da51996f07a3c96e6445697bdedbe56d38a0318fb353d4
```

The quote fingerprint and native transfer-intent commitment therefore become
invalid if the economic token policy changes. This prevents a stale quote or
intent from silently crossing a reviewed policy change.

Source debit is also bounded by the fixed PWRC supply after adding any service
fee transfer. A quote that would require more than the canonical supply fails
before a fingerprint is returned.

Native transaction priority fees use three application safety limits:

```text
compute units max                  400,000
priority price max                 1,000,000 micro-lamports/CU
total priority fee max             400,000 lamports
```

A non-zero priority price requires an explicit compute-unit limit, preventing
the price from being applied against a broader implicit runtime compute limit.


SDK bridge quote calls are typed in both directions and include the canonical
`tokenPolicySha256` field:

```ts
client.bridgeQuoteSolanaToSui(amountBaseUnits)
client.bridgeQuoteSuiToSolana(amountBaseUnits)
```


## Reviewed transfer-fee authority policy

Mainnet release readiness no longer treats two environment variables as
sufficient evidence of the Token-2022 transfer-fee authority policy.

The reviewed release artifact is:

```text
config/mainnet/token-fee-authorities.json
```

It is intentionally **not shipped with placeholder values**. The committed safe
template is:

```text
config/mainnet/token-fee-authorities.example.json
```

The policy commitment domain is:

```text
POWERCHAIN_MAINNET_TRANSFER_FEE_AUTHORITY_POLICY_V1
```

A real reviewed policy must identify the canonical PWRC mint, be explicitly
`configured: true`, contain the reviewed transfer-fee config and
withdraw-withheld authority values (each may explicitly be `null`), and include
an ISO review timestamp plus a non-empty review reference.

To prepare it safely, create a local draft from the example, fill the reviewed
values, and seal it:

```bash
cp config/mainnet/token-fee-authorities.example.json \
  config/mainnet/token-fee-authorities.draft.json

# edit the draft:
# configured = true
# reviewedAt = canonical ISO timestamp
# reviewReference = governance/change-review reference
# set each authority to reviewed Base58 address or explicit null

pnpm mainnet:fee-authorities:seal
pnpm mainnet:fee-authorities:verify
```

The seal command uses create-only semantics and refuses to overwrite an
existing reviewed artifact.

Captured native-token release evidence now includes
`transferFeeAuthorityPolicySha256`, and the Mainnet attestation verifier checks
that commitment against the reviewed policy artifact. Environment authority
values are optional during verification, but if supplied they must match the
reviewed artifact exactly.

Mainnet status remains fail-closed until this reviewed artifact verifies.

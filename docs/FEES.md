# Fee Model

PWRC native fee and PowerChain service fee are independent.

## Native Token-2022 fee

```text
250 bps
maximum 1,000,000 PWRC
ceiling rounding
```

## Service fee

Default policy:

```text
250 bps
disabled by default
PWRC settlement
bridge operations only
recipient required before activation
```

A PWRC service-fee payment is a separate Token-2022 transfer. The quote engine
grosses it up so the configured service wallet receives the intended net
service fee after PWRC's native transfer fee.

The service-fee payment never changes the bridge principal or wPWRC backing.


## Wallet transfers

Native PWRC wallet transfers use the Token-2022
`TransferCheckedWithFee` instruction. The transaction builder calculates the
expected fee using the canonical 250 bps policy and 1,000,000 PWRC cap before
constructing the instruction.

Associated token accounts use idempotent creation when requested. Network base
fees and optional priority fees are separate from the PWRC Token-2022 transfer
fee.

Helius priority-fee estimates may be used to select a compute-unit price, but
the wallet/application remains responsible for signing and submission.


## Transfer-fee authorities

Token-2022 transfer fees have separate configuration and withheld-fee
authorities. PowerChain does not assume or fabricate those identities.

Production verification must define the expected on-chain state:

```env
PWRC_TRANSFER_FEE_CONFIG_AUTHORITY_EXPECTED=
PWRC_WITHDRAW_WITHHELD_AUTHORITY_EXPECTED=
```

Each value must be either a valid 32-byte Solana public key encoded in Base58
or the literal `null` when the authority is expected to be revoked.

Live native-PWRC observation reads both values from `TransferFeeConfig` and
fails if either differs from deployment policy.

## Transaction fee-safety ceilings

The wallet-owned PWRC transaction builder applies application-level ceilings:

```text
compute units:                 400,000 maximum
priority price:             1,000,000 micro-lamports/CU maximum
```

These are PowerChain transaction-safety policy limits, not claims about Solana
network-wide maxima.


## quote integrity

Fee quotes are bounded by the canonical PWRC supply. The principal and total
source debit cannot exceed fixed supply, negative network fees are rejected,
and `grossUpPwrcForNet()` fails explicitly when the requested post-fee net is
unreachable within the fixed supply.

Service-fee recipient validation is chain-specific:

```text
Solana: Base58 value decoding to exactly 32 bytes
Sui:    canonical 0x + 64 lowercase/uppercase-insensitive hex digits
```


## Live epoch fee evidence

Token-2022 `TransferFeeConfig` selects the applicable fee by epoch. PowerChain
therefore records the active fee configuration together with the observed epoch
and finalized slot before using it in the production transaction-builder path.

The evidence commitment domain is:

```text
POWERCHAIN_NATIVE_PWRC_TRANSFER_FEE_EPOCH_V1
```

A verified transaction build requires the observed epoch to still equal the
current epoch and the finalized slot/time evidence to remain inside configured
freshness bounds. Canonical 250 bps / 1,000,000 PWRC maximum-fee mismatches fail
closed before an unsigned transaction is returned.

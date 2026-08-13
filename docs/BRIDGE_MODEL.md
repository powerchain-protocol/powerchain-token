# Bridge Model

## Asset roles

- **PWRC** — canonical Solana Token-2022 asset.
- **wPWRC** — Sui bridged representation.

wPWRC is not an independent canonical supply.

## Units

Both assets use 9 decimals.

```text
1 PWRC base unit = 1 wPWRC base unit
```

There is no decimal scaling factor.

## Solana transfer fee

Canonical Token-2022 transfer fee:

```text
basis points  250
percentage    2.5%
maximum fee   1000000 PWRC
```

This is the canonical transfer-fee mechanism. A separate custom protocol fee
must not be layered on top as if it were the token's canonical transfer fee.

## Solana → Sui

Conceptually:

```text
gross PWRC transfer
- Token-2022 transfer fee
= net spendable canonical backing
= wPWRC minted
```

Example:

```text
gross  1,000,000,000 base units
fee       25,000,000 base units
net      975,000,000 base units
mint     975,000,000 wPWRC base units
```

## Sui → Solana

Conceptually:

```text
wPWRC burned
= gross PWRC release from bridge backing

gross PWRC release
- Token-2022 transfer fee
= net PWRC received by destination
```

## Backing invariant

The intended wrapped exposure model is:

```text
wrapped exposure =
  wPWRC circulating
  + pending Solana→Sui
  + pending Sui→Solana
```

and:

```text
wrapped exposure <= net spendable PWRC bridge backing
```

`pending Solana→Sui` represents finalized canonical lock not yet reflected as
wrapped mint.

`pending Sui→Solana` remains an exposure after the wrapped burn until canonical
release is finalized.

## Genesis

```text
PWRC canonical genesis/max supply  18446000000 PWRC
wPWRC genesis supply               0
```

## Replay protection

Bridge and relayer flows use deterministic idempotency/replay keys and durable
reservation state. Monetary writes must not use blind retry.

## Finality

Runtime policy requires finalized confirmation for canonical completion.

## Deployment identifiers

The current generic bridge config intentionally contains null or template
deployment identifiers. Actual bridge program/vault, Sui package, coin type,
controller and authorities must come from verified chain evidence.

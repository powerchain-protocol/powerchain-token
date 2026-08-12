# PWRC Market Data and Tradeability

PWRC 1.0.0 is designed to remain freely transferable and compatible with
standard Solana DEX/liquidity flows.

## Transferability

The canonical token policy does not use:

- NonTransferable
- DefaultAccountState=frozen
- mandatory transfer-hook allowlists
- receiver allowlists

The protocol fee program is an optional application path; normal PWRC transfers
are not required to route through it.

## No zero transactions

The application layer rejects zero or negative amounts. With 9 decimals, the
smallest valid PWRC amount is:

```text
0.000000001 PWRC = 1 base unit
```

Fee-bearing protocol transfers have a higher minimum because 250 bps must
produce a non-zero integer fee.

## Trading

Code can make PWRC transferable, but it cannot manufacture a real market.
Trading requires an actual canonical mint, a DEX pool/venue, funded liquidity,
and market/indexing support.

## Pyth

Pyth support is configurable via:

```text
PWRC_PYTH_FEED_ID
PYTH_HERMES_URL
```

Do not invent a PWRC/USD feed ID. Configure one only after a real Pyth feed is
available and independently verify its feed identity. Price freshness is
checked before use.

## Birdeye

Birdeye support uses:

```text
BIRDEYE_API_KEY
```

The client supports current price and token market-data queries by Solana mint
address. Birdeye availability/indexing depends on the real mint and market
activity.

## Settlement safety

Market prices use JavaScript `number` only for display/analytics. PWRC
settlement amounts always use integer base units (`bigint`).

## Market-risk hardening

Market integrations fail closed rather than blindly accepting a provider price.

Production guards include:

- price freshness validation;
- Pyth confidence-interval validation;
- optional Pyth/Birdeye cross-provider divergence checks;
- minimum-liquidity gating;
- maximum quote slippage;
- deterministic quote fingerprints;
- short quote expiry;
- circuit-breaker support after provider/oracle failures;
- no floating-point values in PWRC settlement arithmetic.

Pyth prices and confidence values use the same exponent. The client therefore
normalizes both before evaluating confidence width.

Birdeye market-data is used for secondary market/liquidity observations. Provider
availability is not treated as proof that PWRC is listed or liquid.

Risk thresholds in this package are conservative defaults and must be reviewed
against the actual PWRC market before mainnet trading features are enabled.

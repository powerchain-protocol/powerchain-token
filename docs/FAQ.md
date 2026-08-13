# FAQ

## Is PWRC canonical on both Solana and Sui?

No. PWRC is canonical on Solana. wPWRC is the Sui bridged representation.

## Does the bridge charge a separate 2.5% protocol fee?

The canonical 2.5% documented here is the native Token-2022
`TransferFeeConfig` transfer fee. The deprecated custom fee router is not the
canonical fee mechanism.

## Is the wrapped supply pre-minted?

No. wPWRC genesis supply is zero.

## Does `codeReady: true` mean Mainnet is deployed?

No. Build artifacts, real deployment evidence and signed release authorization
are separate gates.

## Can the API execute bridge writes from the browser?

The browser app is status/quote oriented. Monetary execution is a server-to-
server endpoint requiring bearer authentication, idempotency and Mainnet
readiness.

## Does the API retry executor failures?

It does not blindly retry ambiguous monetary failures. Timeout, network failure
and executor 5xx require reconciliation.

## Why is an idempotency key mandatory?

It creates a stable identity for the monetary request, allowing safe replay of
terminal success and preventing conflicting or duplicate writes.

## Can I fill missing deployment IDs manually?

Only from verified chain/deployment evidence. Do not guess or copy local program
IDs into Mainnet configuration.

## Why are there many validation scripts?

The project separates source checks, runtime tests, chain builds, release
provenance, deployment evidence and authorization. Different gates establish
different properties.

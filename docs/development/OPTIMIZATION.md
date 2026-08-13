# Runtime Optimization

Version `1.0.0`.

The runtime uses shared 9-decimal PWRC/wPWRC units, bounded relayer concurrency, in-flight read deduplication, bounded Sui pagination, bounded Solana RPC batches, and fail-closed bridge conservation checks.

Canonical PWRC uses the native Token-2022 TransferFeeConfig at 250 bps, capped at 1,000,000 PWRC. wPWRC uses the same 9-decimal base-unit domain, so there is no decimal scaling step in bridge accounting.

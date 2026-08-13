# Transactions

PowerChain `1.0.0` uses native Solana Token-2022 transfers for PWRC. The canonical transfer path uses `TransferCheckedWithFee` with the expected 250 bps fee and the 1,000,000 PWRC fee cap.

Production write policy:

1. validate canonical mint and Token-2022 accounts;
2. calculate the exact expected transfer fee;
3. simulate the transaction;
4. fetch a current blockhash;
5. submit once with preflight enabled;
6. confirm with the blockhash/last-valid-height strategy at `finalized`;
7. on ambiguous transport results, reconcile the known signature before any retry.

Blind write retries are forbidden. Read-only RPC calls may use bounded exponential retry.

The deprecated `pwrc-fees` router is not part of the canonical transfer path and no second custom protocol fee is collected.

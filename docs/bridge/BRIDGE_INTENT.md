# Bridge Intent

PowerChain version `1.0.0` uses the same 9-decimal base-unit domain on Solana PWRC and Sui wPWRC with base-unit factor `1`.

Canonical PWRC uses Token-2022 `TransferFeeConfig` at 250 bps (2.5%), capped at 1,000,000 PWRC. Solana→Sui bridge issuance is based on the net PWRC credited as backing after the Token-2022 transfer fee. Sui→Solana burns wPWRC equal to the gross canonical PWRC release; the destination transfer then applies the native Token-2022 fee.

Replay protection, deployment identity, finality and conservation checks remain fail-closed. Mainnet IDs and Sui package/object IDs must come from verified deployment evidence.

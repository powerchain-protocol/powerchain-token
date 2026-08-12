# Bridge Deployment Evidence

Version: `1.0.0`

A production bridge deployment evidence record binds the reviewed source and
actual chain identities used by the release.

Required evidence includes:

- reviewed source SHA-256 commitment;
- generated Anchor IDL hashes for `pwrc_lock` and `pwrc_token`;
- normalized Sui module evidence;
- Solana bridge program ID and executable-account verification;
- canonical PWRC mint `PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc`;
- Token-2022 mint-state verification;
- 9 decimals and exact supply state;
- mint-authority and freeze-authority state;
- `TransferFeeConfig` at 250 bps with 1,000,000 PWRC maximum fee;
- transfer-fee config authority and withdraw-withheld authority evidence;
- Solana bridge vault and ownership/custody evidence;
- Sui package ID;
- Sui BridgeController object;
- Sui Currency/metadata object evidence;
- exact wPWRC coin type;
- wPWRC 9-decimal and zero-genesis verification;
- common base-unit factor `1`;
- bridge/operator/governor identities and separation evidence;
- network/genesis/finality references;
- deployment transaction/checkpoint/slot references;
- deterministic evidence SHA-256 commitment.

The configured Sui `powerchain` address alias is not treated as a package ID
unless deployment evidence proves that exact value is the published package.

Development/localnet identities and source configuration are not Mainnet
deployment evidence. Mainnet checks remain fail-closed until all required
artifacts and chain observations are verified.

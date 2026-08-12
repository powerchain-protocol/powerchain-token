# Bridge Deployment Evidence

Version: `1.0.0`

A bridge deployment evidence record binds:

- reviewed source SHA-256 commitment;
- Solana source bridge program ID;
- canonical PWRC mint;
- Solana bridge vault;
- Sui package ID;
- Sui BridgeController object;
- Sui Currency object;
- exact wPWRC coin type;
- canonical decimals `9`;
- wrapped decimals `6`;
- conversion factor `1000`;
- operator;
- governor;
- network;
- generation timestamp.

The evidence is itself SHA-256 committed using canonical JSON.

Development placeholders are not valid Mainnet evidence.

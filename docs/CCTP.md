# Circle CCTP v2

CCTP is integrated as a USDC settlement rail.

Supported PowerChain uses:

- x402 USDC payments;
- AI compute funding;
- checkout settlement;
- cross-chain treasury settlement.

CCTP must **not** be represented as the PWRC/wPWRC bridge. CCTP burns native
USDC on the source domain and mints native USDC on the destination domain.

Production verification requires:

- official CCTP v2 program/domain configuration;
- source transaction confirmation/finality policy;
- Circle attestation verification;
- destination message receipt verification;
- idempotent message tracking;
- exact amount and recipient validation.

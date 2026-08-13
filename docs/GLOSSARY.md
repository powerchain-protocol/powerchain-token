# Glossary

**PWRC**  
Canonical PowerChain token on Solana Token-2022.

**wPWRC**  
Sui wrapped/bridged representation of PWRC.

**Base unit**  
Smallest integer token unit. PWRC and wPWRC both use 9 decimals.

**Token-2022**  
Solana token program used by the canonical PWRC mint.

**TransferFeeConfig**  
Token-2022 extension implementing the canonical 250-bps transfer fee with the
configured maximum fee.

**Canonical backing**  
Net spendable PWRC held/locked to support wPWRC exposure.

**Wrapped exposure**  
wPWRC circulating plus pending bridge obligations.

**Quote fingerprint**  
Deterministic SHA-256 commitment over server-owned bridge quote fields.

**Idempotency key**  
Caller-supplied safe operation identifier used to prevent duplicate monetary
execution.

**Ambiguous execution**  
A state where the system cannot prove whether the external monetary write
landed, for example after a timeout or transport failure.

**Reconciliation**  
Process of determining the real terminal state of an ambiguous operation before
any further write is permitted.

**Source readiness**  
Static/source-level repository readiness.

**Build readiness**  
Qualified generated artifacts and build manifest are present and verified.

**Evidence readiness**  
Real deployment and governance evidence is complete and cryptographically
verified.

**Release authorization**  
Short-lived Ed25519-signed authorization bound to the exact evidence,
provenance, build manifest, network, mint and nonce.

**Authorization consumption**  
Atomic one-time record marking the authorized release boundary as used.

**Provenance**  
SHA-256 commitments over source and required release inputs.

**IDL**  
Interface description artifacts for chain programs/modules.

**Finalized**  
Chain finality level used for canonical transaction completion.

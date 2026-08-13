# ZK / Confidential Transfers

Solana Token-2022 supports confidential transfers using zero-knowledge proofs.

PWRC 1.0.0 keeps the canonical mint's confidential-transfer extension disabled
by default. This preserves the minimal, audited extension profile.

Any confidential-transfer experiment must:

- run on a separate devnet-qualified mint/configuration first;
- generate required proofs client-side;
- avoid server custody of ElGamal/private wallet keys;
- define auditor-key/compliance policy where required;
- verify proof-program compatibility;
- undergo explicit governance/security review before changing the canonical
  mint profile.

Enabling a Token-2022 extension is treated as a protocol change, not a UI flag.

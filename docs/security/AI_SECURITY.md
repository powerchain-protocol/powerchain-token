# AI Compute Security

PWRC 1.0.0 can be used as a utility/payment asset for AI compute, but the model
must never receive unrestricted signing authority or infrastructure secrets.

Security baseline:

- short-lived signed compute-job tickets;
- unique job ID + nonce;
- prompt SHA-256 commitment;
- server-side token/tool/cost budgets;
- tool allowlists;
- default-deny network egress for compute workers;
- no wallet seed phrases or private keys in model prompts/context;
- no model-controlled arbitrary shell execution;
- idempotent settlement references;
- audit records for quote, payment, job, usage and settlement;
- separate payment signer from AI worker identity.

A job ticket authorizes a bounded computation. It does not authorize arbitrary
future payments or general wallet access.

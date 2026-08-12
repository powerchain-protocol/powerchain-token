# Release Provenance

Version: `1.0.0`

`pnpm pwrc:release:provenance` produces a deterministic source-tree commitment
plus SHA-256 commitments for the major token, bridge, program, metadata, and
changelog inputs.

The provenance report is evidence only; it does not claim an on-chain build or
deployment. Mainnet release still requires the real dependency lockfile,
verified program/package deployments, and deployment/signature evidence.

# bigint-buffer safe compatibility package

This workspace package replaces the unmaintained public `bigint-buffer`
dependency inside the PowerChain dependency graph.

The public `bigint-buffer` `1.1.5` release is affected by CVE-2025-3194 and has
no patched upstream npm release. PowerChain therefore overrides it with this
pure-JavaScript compatibility implementation.

Security properties:

- no native addon
- no install/preinstall/postinstall lifecycle scripts
- accepts only `Buffer`/`Uint8Array`
- rejects inputs or output widths above 1 MiB
- no unchecked native memory copy
- same core exports used by Solana buffer-layout consumers:
  `toBigIntBE`, `toBigIntLE`, `toBufferBE`, `toBufferLE`

This package is an internal compatibility control and must not be published as
the upstream `bigint-buffer` package.

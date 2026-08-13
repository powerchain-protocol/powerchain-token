# PWRC Verification

Canonical checks:

1. Mint address matches the published PWRC registry entry.
2. Mint account is owned by Token-2022 (`TokenzQd...`).
3. Decimals equal 9.
4. Genesis raw supply equals `18446000000000000000` before finalization.
5. Freeze authority is absent.
6. Mint authority is absent after finalization.
7. Metadata name/symbol are `PowerChain` / `PWRC` and the metadata pointer/token metadata extensions are present.
8. Release hashes match the published release bundle.

After holder burns, current supply can be below genesis/max supply; it must never exceed max supply.

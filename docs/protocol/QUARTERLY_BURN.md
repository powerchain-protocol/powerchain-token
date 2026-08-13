# PWRC Quarterly Burn

PowerChain PWRC `1.0.0` uses a **2% quarterly canonical burn policy**.

## Canonical burn rule

The target is calculated from the **current live canonical Solana PWRC supply**:

```text
target burn =
floor(current canonical supply × 200 / 10,000)
```

The burn must be funded by an approved PowerChain-controlled token account.
Ordinary holder balances are never debited.

At the genesis supply of 18,446,000,000 PWRC, the first illustrative 2% burn is:

```text
burn:              368,920,000 PWRC
post-burn supply: 18,077,080,000 PWRC
```

Later quarters compound from the then-current live supply rather than repeatedly
using the original genesis supply.

## wPWRC cross-chain safety

wPWRC on Sui does not perform an independent quarterly burn. The canonical
Solana burn controls the supply reduction.

The Sui BridgeController now stores `canonical_supply_ceiling`. It starts at
the genesis ceiling and can only be **lowered**, never increased.

After a finalized Solana burn:

1. pause the wPWRC bridge;
2. verify finalized Solana burn evidence;
3. verify current wPWRC exposure and locked canonical backing;
4. lower the Sui canonical supply ceiling to the finalized post-burn Solana supply;
5. record the 32-byte burn-evidence hash in the Sui event;
6. verify the new ceiling and conservation state;
7. unpause only after verification.

The Move call rejects a new ceiling if it is not lower than the old ceiling or
if it would be below currently outstanding wPWRC supply.

## Sui identity

```text
alias:   powerchain
address: 0x4a4a81c5e4a520c1b4d7b5b572a0567f48c6c7e85257f0a13e65639cfba49fb1
```

Verify the local Sui CLI identity before administrative operations:

```bash
bash scripts/sui/use-powerchain.sh
```

## Production execution

The repository calculates and validates a quarterly burn but does not store a
private key and does not automatically sign a scheduled burn.

Required production controls include simulation, explicit signer/multisig
approval, finalized confirmation, one burn ID per quarter, before/after supply
verification, and SHA-256 evidence.

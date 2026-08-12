# Programs

`programs/pwrc-lock` is the active Anchor bridge program. It locks canonical PWRC and releases only against authenticated Sui burn evidence. It uses 9/9 decimals, 1:1 base units, receipt-PDA replay protection, pause-gated governance rotations, and stronger Sui transaction/checkpoint evidence on release.

`contracts/wpwrc` is the active Sui package. It starts with zero wPWRC and encapsulates `TreasuryCap<WPWRC>` inside the shared bridge controller.

`programs/pwrc-fees` is deprecated and not part of canonical transfers or Mainnet deployment.

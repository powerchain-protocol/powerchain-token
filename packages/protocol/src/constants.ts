export const PWRC_VERSION = "1.0.0" as const;
export const PWRC_NAME = "PowerChain" as const;
export const PWRC_SYMBOL = "PWRC" as const;
export const PWRC_CANONICAL_MINT =
  "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc" as const;
export const PWRC_DECIMALS = 9 as const;
export const PWRC_SCALE = 1_000_000_000n;
export const PWRC_GENESIS_SUPPLY = 18_446_000_000n;
export const PWRC_GENESIS_BASE_UNITS =
  PWRC_GENESIS_SUPPLY * PWRC_SCALE;
export const PWRC_MAX_BASE_UNITS = PWRC_GENESIS_BASE_UNITS;
export const U64_MAX = 18_446_744_073_709_551_615n;

export const METAPLEX_TOKEN_METADATA_PROGRAM_ID =
  "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s" as const;
export const PWRC_METADATA_URI =
  "https://token.powerchain.energy/metadata/metadata.json" as const;
export const PWRC_METADATA_IMAGE_URI =
  "https://token.powerchain.energy/assets/tokens/pwrc-logo.png" as const;

export const SOLANA_TOKEN_2022_PROGRAM_ID =
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb" as const;

export const PWRC_TRANSFER_FEE_BPS = 250n;
export const PWRC_MAX_TRANSFER_FEE_BASE_UNITS =
  1_000_000_000_000_000n;

export const PWRC_SERVICE_FEE_BPS_DEFAULT = 250n;

export const POWERCHAIN_TRANSACTION_FEE_SOLANA =
  "FeeszhrKKEsvxr1kg8LDtPx6BLcEbYHiAThYaxajNhqy" as const;
export const POWERCHAIN_TRANSACTION_FEE_SUI =
  "0xc23c9622a09c5533fd18f35703622dc2df44206749a1761202d2024a04a36f50" as const;

export const PWRC_TOKEN_VERIFIER_PROGRAM_ID =
  "PWRCpWCpQ8BRn3pzMnvaTzMK9Q2GsxuLx7QgJgduLSu" as const;
export const PWRC_LOCK_LOCALNET_PROGRAM_ID =
  "7JAV3PsxkHh5oKAFDMKqVpKaV2P2P5Vj3Qv15hH8wPwr" as const;

export const WPWRC_NAME = "Wrapped PowerChain" as const;
export const WPWRC_SYMBOL = "wPWRC" as const;
export const WPWRC_DECIMALS = 9 as const;
export const WPWRC_GENESIS_SUPPLY_BASE_UNITS = 0n;
export const PWRC_BASE_UNITS_PER_WPWRC_BASE_UNIT = 1n;

if (PWRC_GENESIS_BASE_UNITS !== 18_446_000_000_000_000_000n) {
  throw new Error("PWRC_CANONICAL_SUPPLY_CHANGED");
}
if (PWRC_GENESIS_BASE_UNITS > U64_MAX) {
  throw new Error("PWRC_SUPPLY_EXCEEDS_U64");
}

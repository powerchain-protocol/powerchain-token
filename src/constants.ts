import { SOLANA_TOKEN_2022_PROGRAM_ID } from "./solana.js";

export const PWRC_VERSION = "1.0.0" as const;
export const PWRC_NAME = "PowerChain" as const;
export const PWRC_SYMBOL = "PWRC" as const;
export const PWRC_CANONICAL_MINT =
  "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc" as const;
export const PWRC_DECIMALS = 9 as const;
export const PWRC_GENESIS_SUPPLY = 18_446_000_000n;
export const PWRC_SCALE = 1_000_000_000n;
export const PWRC_GENESIS_BASE_UNITS = PWRC_GENESIS_SUPPLY * PWRC_SCALE;
export const PWRC_MAX_SUPPLY = PWRC_GENESIS_SUPPLY;
export const PWRC_MAX_BASE_UNITS = PWRC_GENESIS_BASE_UNITS;
export const U64_MAX = 18_446_744_073_709_551_615n;
export const TOKEN_2022_PROGRAM_ID = SOLANA_TOKEN_2022_PROGRAM_ID;

export const PWRC_TRANSFER_FEE_BPS = 250n;
export const PWRC_TRANSFER_FEE_BPS_NUMBER = 250 as const;
export const PWRC_BPS_DENOMINATOR = 10_000n;
export const PWRC_MAX_TRANSFER_FEE_TOKENS = 1_000_000n;
export const PWRC_MAX_TRANSFER_FEE_BASE_UNITS = 1_000_000_000_000_000n;

export const PWRC_METADATA_URI =
  "https://token.powerchain.energy/metadata/metadata.json" as const;
export const WPWRC_METADATA_URI =
  "https://token.powerchain.energy/metadata/wpwrc.metadata.json" as const;
export const PWRC_IMAGE_URI =
  "https://token.powerchain.energy/assets/tokens/pwrc-logo.png" as const;
export const WPWRC_IMAGE_URI =
  "https://token.powerchain.energy/assets/tokens/wpwrc-logo.png" as const;

export const PWRC_LOCK_LOCALNET_PROGRAM_ID =
  "7JAV3PsxkHh5oKAFDMKqVpKaV2P2P5Vj3Qv15hH8wPwr" as const;
export const PWRC_TOKEN_VERIFIER_LOCALNET_PROGRAM_ID =
  "HRrDxwZzuFreRmkCLY9oFXNGAy2gjd3diHyyTadxd8s6" as const;

export const WPWRC_DECIMALS = 9 as const;
export const WPWRC_SCALE = 1_000_000_000n;
export const PWRC_BASE_UNITS_PER_WPWRC_BASE_UNIT = 1n;
export const WPWRC_MAX_BASE_UNITS = PWRC_MAX_BASE_UNITS;
export const WPWRC_GENESIS_SUPPLY_BASE_UNITS = 0n;

export const PWRC_FINALITY = "finalized" as const;
export const PWRC_PREFLIGHT_COMMITMENT = "confirmed" as const;
export const PWRC_RPC_TIMEOUT_MS = 10_000 as const;
export const PWRC_WRITE_CONFIRM_TIMEOUT_MS = 60_000 as const;

if (PWRC_GENESIS_BASE_UNITS !== 18_446_000_000_000_000_000n) {
  throw new Error("PWRC_CANONICAL_SUPPLY_CHANGED");
}
if (PWRC_GENESIS_BASE_UNITS > U64_MAX) {
  throw new Error("PWRC_SUPPLY_EXCEEDS_U64");
}

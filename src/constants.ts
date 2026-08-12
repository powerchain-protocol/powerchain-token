import { SOLANA_TOKEN_2022_PROGRAM_ID } from "./solana.js";

export const PWRC_VERSION = "1.0.0" as const;
export const PWRC_NAME = "PowerChain" as const;
export const PWRC_SYMBOL = "PWRC" as const;
export const PWRC_DECIMALS = 9 as const;
export const PWRC_GENESIS_SUPPLY = 18_446_000_000n;
export const PWRC_SCALE = 1_000_000_000n;
export const PWRC_GENESIS_BASE_UNITS = PWRC_GENESIS_SUPPLY * PWRC_SCALE;
export const PWRC_MAX_SUPPLY = PWRC_GENESIS_SUPPLY;
export const PWRC_MAX_BASE_UNITS = PWRC_GENESIS_BASE_UNITS;
export const U64_MAX = 18_446_744_073_709_551_615n;
export const TOKEN_2022_PROGRAM_ID = SOLANA_TOKEN_2022_PROGRAM_ID;

export const WPWRC_DECIMALS = 9 as const;
export const WPWRC_SCALE = 1_000_000_000n;
export const PWRC_BASE_UNITS_PER_WPWRC_BASE_UNIT = 1n;
export const WPWRC_MAX_BASE_UNITS = PWRC_MAX_BASE_UNITS;
export const WPWRC_GENESIS_SUPPLY_BASE_UNITS = 0n;

if (PWRC_GENESIS_BASE_UNITS !== 18_446_000_000_000_000_000n) {
  throw new Error("PWRC_CANONICAL_SUPPLY_CHANGED");
}
if (PWRC_GENESIS_BASE_UNITS > U64_MAX) {
  throw new Error("PWRC_SUPPLY_EXCEEDS_U64");
}

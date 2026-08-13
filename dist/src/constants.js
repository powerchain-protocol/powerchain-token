import { SOLANA_TOKEN_2022_PROGRAM_ID } from "./solana.js";
export const PWRC_VERSION = "1.0.0";
export const PWRC_NAME = "PowerChain";
export const PWRC_SYMBOL = "PWRC";
export const PWRC_CANONICAL_MINT = "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc";
export const PWRC_CANONICAL_MINT_ADDRESS = PWRC_CANONICAL_MINT;
export const PWRC_DECIMALS = 9;
export const PWRC_GENESIS_SUPPLY = 18446000000n;
export const PWRC_SCALE = 1000000000n;
export const PWRC_GENESIS_BASE_UNITS = PWRC_GENESIS_SUPPLY * PWRC_SCALE;
export const PWRC_MAX_SUPPLY = PWRC_GENESIS_SUPPLY;
export const PWRC_MAX_BASE_UNITS = PWRC_GENESIS_BASE_UNITS;
export const U64_MAX = 18446744073709551615n;
export const TOKEN_2022_PROGRAM_ID = SOLANA_TOKEN_2022_PROGRAM_ID;
export const PWRC_TRANSFER_FEE_BPS = 250n;
export const PWRC_TRANSFER_FEE_BPS_NUMBER = 250;
export const PWRC_BPS_DENOMINATOR = 10000n;
export const PWRC_MAX_TRANSFER_FEE_TOKENS = 1000000n;
export const PWRC_MAX_TRANSFER_FEE_BASE_UNITS = 1000000000000000n;
export const PWRC_METADATA_URI = "https://token.powerchain.energy/metadata/metadata.json";
export const WPWRC_METADATA_URI = "https://token.powerchain.energy/metadata/wpwrc.metadata.json";
export const PWRC_IMAGE_URI = "https://token.powerchain.energy/assets/tokens/pwrc-logo.png";
export const WPWRC_IMAGE_URI = "https://token.powerchain.energy/assets/tokens/wpwrc-logo.png";
export const PWRC_LOCK_LOCALNET_PROGRAM_ID = "7JAV3PsxkHh5oKAFDMKqVpKaV2P2P5Vj3Qv15hH8wPwr";
export const PWRC_TOKEN_VERIFIER_LOCALNET_PROGRAM_ID = "HRrDxwZzuFreRmkCLY9oFXNGAy2gjd3diHyyTadxd8s6";
export const WPWRC_DECIMALS = 9;
export const WPWRC_SCALE = 1000000000n;
export const PWRC_BASE_UNITS_PER_WPWRC_BASE_UNIT = 1n;
export const WPWRC_MAX_BASE_UNITS = PWRC_MAX_BASE_UNITS;
export const WPWRC_GENESIS_SUPPLY_BASE_UNITS = 0n;
export const PWRC_FINALITY = "finalized";
export const PWRC_PREFLIGHT_COMMITMENT = "confirmed";
export const PWRC_RPC_TIMEOUT_MS = 10_000;
export const PWRC_WRITE_CONFIRM_TIMEOUT_MS = 60_000;
if (PWRC_GENESIS_BASE_UNITS !== 18446000000000000000n) {
    throw new Error("PWRC_CANONICAL_SUPPLY_CHANGED");
}
if (PWRC_GENESIS_BASE_UNITS > U64_MAX) {
    throw new Error("PWRC_SUPPLY_EXCEEDS_U64");
}
//# sourceMappingURL=constants.js.map
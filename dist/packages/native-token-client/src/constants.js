import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
export const PWRC_NAME = "PowerChain";
export const PWRC_SYMBOL = "PWRC";
export const WPWRC_SYMBOL = "wPWRC";
export const PWRC_DECIMALS = 9;
export const WPWRC_DECIMALS = 9;
export const PWRC_SCALE = 1000000000n;
export const WPWRC_SCALE = 1000000000n;
export const PWRC_MAX_SUPPLY = 18446000000n;
export const PWRC_MAX_BASE_UNITS = 18446000000000000000n;
export const PWRC_TRANSFER_FEE_BPS = 250;
export const PWRC_MAX_TRANSFER_FEE_TOKENS = 1000000n;
export const PWRC_MAX_TRANSFER_FEE_BASE_UNITS = 1000000000000000n;
export const PWRC_CANONICAL_MINT_ADDRESS = "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc";
export const PWRC_METADATA_URI = "https://powerchain.energy/metadata/metaplex.json";
export const PWRC_TOKEN_PROGRAM_ID = TOKEN_2022_PROGRAM_ID;
export const PWRC_TOKEN_PROGRAM_ADDRESS = TOKEN_2022_PROGRAM_ID.toBase58();
export const SOLSCAN_BASE_URL = "https://solscan.io";
export const SUI_NETWORKS = {
    testnet: "https://fullnode.testnet.sui.io:443",
    mainnet: "https://fullnode.mainnet.sui.io:443",
    devnet: "https://fullnode.devnet.sui.io:443",
    local: "http://127.0.0.1:9000",
};
export const DEFAULT_SUI_NETWORK = "testnet";
export const PRODUCTION_SUI_NETWORK = "mainnet";
//# sourceMappingURL=constants.js.map
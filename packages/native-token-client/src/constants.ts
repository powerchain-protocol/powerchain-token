import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";

export const PWRC_NAME = "PowerChain" as const;
export const PWRC_SYMBOL = "PWRC" as const;
export const WPWRC_SYMBOL = "wPWRC" as const;

export const PWRC_DECIMALS = 9 as const;
export const WPWRC_DECIMALS = 9 as const;

export const PWRC_SCALE = 1_000_000_000n;
export const WPWRC_SCALE = 1_000_000_000n;

export const PWRC_MAX_SUPPLY = 18_446_000_000n;
export const PWRC_MAX_BASE_UNITS =
  18_446_000_000_000_000_000n;

export const PWRC_TRANSFER_FEE_BPS = 250 as const;
export const PWRC_MAX_TRANSFER_FEE_TOKENS = 1_000_000n;
export const PWRC_MAX_TRANSFER_FEE_BASE_UNITS = 1000000000000000n;
export const PWRC_CANONICAL_MINT_ADDRESS = "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc" as const;
export const PWRC_METADATA_URI = "https://powerchain.energy/metadata/metaplex.json" as const;

export const PWRC_TOKEN_PROGRAM_ID =
  TOKEN_2022_PROGRAM_ID;

export const PWRC_TOKEN_PROGRAM_ADDRESS =
  TOKEN_2022_PROGRAM_ID.toBase58();

export const SOLSCAN_BASE_URL =
  "https://solscan.io" as const;

export const SUI_NETWORKS = {
  testnet: "https://fullnode.testnet.sui.io:443",
  mainnet: "https://fullnode.mainnet.sui.io:443",
  devnet: "https://fullnode.devnet.sui.io:443",
  local: "http://127.0.0.1:9000",
} as const;

export const DEFAULT_SUI_NETWORK =
  "testnet" as const;

export const PRODUCTION_SUI_NETWORK =
  "mainnet" as const;

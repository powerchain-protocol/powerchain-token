export type PowerChainCluster =
  | "mainnet-beta"
  | "devnet"
  | "localnet";

export type PowerChainSuiNetwork =
  | "mainnet"
  | "testnet"
  | "devnet"
  | "local";

export interface PwrcMintSnapshot {
  address: string;
  decimals: 9;
  supplyBaseUnits: bigint;
  mintAuthority: string | null;
  freezeAuthority: string | null;
  tokenProgram: "Token-2022";
}

export interface WpwrcAssetSnapshot {
  coinType: string;
  decimals: 9;
  totalSupplyBaseUnits: bigint;
  network: PowerChainSuiNetwork;
}

export interface BridgeAssetPair {
  canonical: {
    chain: "solana";
    network: "mainnet-beta";
    symbol: "PWRC";
    decimals: 9;
  };
  wrapped: {
    chain: "sui";
    symbol: "wPWRC";
    decimals: 9;
  };
  ratio: "1:1";
}

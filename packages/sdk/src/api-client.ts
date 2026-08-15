import {
  assertPositivePwrcBaseUnitsString,
} from "@powerchain/protocol/token-amount";

export interface PowerChainApiClientOptions {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

export interface PowerChainApiErrorShape {
  error?: string;
  errorCode?: string;
  requestId?: string;
}

export class PowerChainApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId: string | null;

  constructor(
    status: number,
    payload: PowerChainApiErrorShape,
  ) {
    const code =
      payload.errorCode ??
      payload.error ??
      `PWRC_API_HTTP_${status}`;

    super(code);
    this.name =
      "PowerChainApiError";
    this.status =
      status;
    this.code =
      code;
    this.requestId =
      payload.requestId ??
      null;
  }
}


export interface PowerChainFeeQuote {
  version: "1.0.0";
  tokenPolicySha256:
    "cfaac8d0c647bf3e62da51996f07a3c96e6445697bdedbe56d38a0318fb353d4";
  operation:
    | "bridge-solana-to-sui"
    | "bridge-sui-to-solana"
    | "wallet-transfer"
    | "quote-preview";
  principalSourceChain:
    "solana" | "sui" | null;
  principalSourceAsset:
    "PWRC" | "wPWRC" | null;
  principalGrossBaseUnits: string;
  nativeTransferFeeBaseUnits: string;
  principalNetBaseUnits: string;
  destinationNativeTransferFeeBaseUnits: string;
  destinationNetBaseUnits: string;
  serviceFeeEnabled: boolean;
  serviceFeeBasisPoints: number;
  serviceFeeNetBaseUnits: string;
  serviceFeeGrossTransferBaseUnits: string;
  serviceFeeTransferNativeFeeBaseUnits: string;
  serviceFeeRecipient: string | null;
  serviceFeeSourceChain:
    "solana" | "sui" | null;
  serviceFeeAsset:
    "PWRC" | "wPWRC" | null;
  totalNativeTokenFeesBaseUnits: string;
  totalSourceDebitBaseUnits: string;
  totalWalletPwrcDebitBaseUnits: string;
  issuedAt: string;
  expiresAt: string;
  quoteFingerprint: string;
  requestId: string;
}

export function createPowerChainApiClient(
  options:
    PowerChainApiClientOptions =
      {},
) {
  const baseUrl =
    options.baseUrl ??
    "";
  const fetchImpl =
    options.fetchImpl ??
    fetch;

  async function get<T>(
    path: string,
  ): Promise<T> {
    const response =
      await fetchImpl(
        `${baseUrl}${path}`,
        {
          method:
            "GET",
          headers: {
            accept:
              "application/json",
          },
        },
      );

    const payload =
      await response.json() as
        T &
        PowerChainApiErrorShape;

    if (!response.ok) {
      throw new PowerChainApiError(
        response.status,
        payload,
      );
    }

    return payload;
  }

  return {
    index() {
      return get<{
        version: "1.0.0";
        basePath: "/api/v1";
        endpoints: Array<{
          method: "GET";
          path: string;
          operationId: string;
          tag: string;
          summary: string;
        }>;
      }>("/api/v1");
    },

    health() {
      return get<{
        ok: true;
        version: "1.0.0";
        serviceFeeEnabled: boolean;
        requestId: string;
      }>("/api/v1/health");
    },

    ready() {
      return get<{
        ok: boolean;
        ready: boolean;
        version: "1.0.0";
        runtime: Record<string, unknown>;
        release: Record<string, unknown>;
        requestId: string;
      }>("/api/v1/ready");
    },

    version() {
      return get<{
        version: "1.0.0";
        apiVersion: "v1";
        release: "powerchain-token-1.0.0";
        requestId: string;
      }>("/api/v1/version");
    },

    token() {
      return get<{
        version: "1.0.0";
        name: "PowerChain";
        symbol: "PWRC";
        mint: string;
        tokenProgram: string;
        decimals: 9;
        genesisSupplyTokens: string;
        genesisSupplyBaseUnits: string;
        nativeTransferFeeBps: 250;
        nativeTransferFeeCapTokens: "1000000";
        requestId: string;
      }>("/api/v1/token");
    },


tokenPolicy() {
  return get<{
    version:
      "1.0.0";
    canonical:
      true;
    native: {
      chain:
        "solana";
      network:
        "mainnet-beta";
      name:
        "PowerChain";
      symbol:
        "PWRC";
      mint:
        string;
      standard:
        "Token-2022";
      tokenProgram:
        string;
      decimals:
        9;
      fixedSupplyTokens:
        "18446000000";
      fixedSupplyBaseUnits:
        "18446000000000000000";
      u64Max:
        string;
      u64HeadroomBaseUnits:
        "744073709551615";
      extensions:
        readonly [
          "TransferFeeConfig",
          "MetadataPointer",
          "TokenMetadata",
        ];
      transferFee: {
        basisPoints:
          "250";
        maximumFeeBaseUnits:
          "1000000000000000";
        capStartsAtGrossBaseUnits:
          "40000000000000000";
        rounding:
          "ceil";
      };
      authorities: {
        mintAuthorityAfterGenesis:
          null;
        freezeAuthority:
          null;
        transferFeeAuthorities:
          "release-evidence-required";
      };
      metadata:
        Record<string, string>;
    };
    wrapped: {
      chain:
        "sui";
      network:
        "mainnet";
      name:
        "Wrapped PowerChain";
      symbol:
        "wPWRC";
      standard:
        "Sui Coin";
      decimals:
        9;
      genesisSupplyBaseUnits:
        "0";
      maxWrappedSupplyBaseUnits:
        "18446000000000000000";
      canonicalBaseUnitsPerWrappedBaseUnit:
        "1";
      supplyModel:
        "mint-on-verified-lock-burn-before-release";
      metadata:
        Record<string, string>;
    };
    policyDomain:
      "POWERCHAIN_PWRC_TOKEN_POLICY_V1";
    policySha256:
      "cfaac8d0c647bf3e62da51996f07a3c96e6445697bdedbe56d38a0318fb353d4";
    publicWrites:
      false;
    requestId:
      string;
  }>("/api/v1/token/policy");
},

    network() {
      return get<Record<string, unknown>>(
        "/api/v1/network",
      );
    },

    releaseStatus() {
      return get<Record<string, unknown>>(
        "/api/v1/release/status",
      );
    },

    devnetStatus() {
      return get<Record<string, unknown>>(
        "/api/v1/devnet/status",
      );
    },

    bridgeStatus() {
      return get<Record<string, unknown>>(
        "/api/v1/bridge/status",
      );
    },

    bridgeQuoteSolanaToSui(
      amountBaseUnits: bigint | string,
    ) {
      const amount =
        amountBaseUnits.toString();

      assertPositivePwrcBaseUnitsString(
        amount,
      );

      return get<PowerChainFeeQuote>(
        `/api/v1/bridge/quote/solana-to-sui?amountBaseUnits=${amount}`,
      );
    },

    bridgeQuoteSuiToSolana(
      amountBaseUnits: bigint | string,
    ) {
      const amount =
        amountBaseUnits.toString();

      assertPositivePwrcBaseUnitsString(
        amount,
      );

      return get<PowerChainFeeQuote>(
        `/api/v1/bridge/quote/sui-to-solana?amountBaseUnits=${amount}`,
      );
    },
  };
}

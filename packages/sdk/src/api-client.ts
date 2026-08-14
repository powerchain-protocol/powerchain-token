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

      if (
        !/^[1-9][0-9]*$/.test(
          amount,
        )
      ) {
        throw new Error(
          "PWRC_AMOUNT_INVALID",
        );
      }

      return get<Record<string, unknown>>(
        `/api/v1/bridge/quote/solana-to-sui?amountBaseUnits=${amount}`,
      );
    },
  };
}

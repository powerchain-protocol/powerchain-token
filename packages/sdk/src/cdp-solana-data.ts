export interface CdpSqlMetadata {
  cached?: boolean;
  executionTimestamp?: string;
  executionTimeMs?: number;
  rowCount?: number;
}

export interface CdpSolanaDataResponse<T> {
  version: "1.0.0";
  provider: "coinbase-cdp-sql-api";
  network: "solana-mainnet";
  kind: string;
  queryWindow: {
    days: number;
    limit: number;
  };
  canonicalMint: string;
  metadata: CdpSqlMetadata | null;
  schema: unknown;
  result: T[];
  requestId?: string;
}

export interface PwrcTransferRow {
  block_time: string;
  tx_id: string;
  source?: string;
  destination?: string;
  source_owner?: string;
  destination_owner?: string;
  mint: string;
  amount: string | number;
  instruction_id?: string;
}

export interface PwrcVolumeRow {
  day: string;
  transfer_count: string | number;
  volume_base_units: string | number;
}

export interface PwrcInstructionRow {
  block_time: string;
  tx_id: string;
  instruction_id: string;
  instruction_name: string;
  executing_account: string;
  accounts?: unknown;
  account_owners?: unknown;
  args?: unknown;
}

export interface PowerChainDataClientOptions {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
}

function integer(
  value: number,
  min: number,
  max: number,
  code: string,
): number {
  if (
    !Number.isSafeInteger(value) ||
    value < min ||
    value > max
  ) {
    throw new Error(code);
  }

  return value;
}

function queryWindow(
  days = 7,
  limit = 100,
) {
  return {
    days:
      integer(
        days,
        1,
        90,
        "PWRC_CDP_DAYS_INVALID",
      ),
    limit:
      integer(
        limit,
        1,
        1_000,
        "PWRC_CDP_LIMIT_INVALID",
      ),
  };
}

export function createPowerChainDataClient(
  options:
    PowerChainDataClientOptions =
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
  ): Promise<
    CdpSolanaDataResponse<T>
  > {
    const response =
      await fetchImpl(
        `${baseUrl}${path}`,
        {
          headers: {
            accept:
              "application/json",
          },
        },
      );

    const payload =
      await response.json() as
        CdpSolanaDataResponse<T> & {
          error?: string;
        };

    if (!response.ok) {
      throw new Error(
        payload.error ??
        `PWRC_DATA_REQUEST_FAILED:${response.status}`,
      );
    }

    return payload;
  }

  return {
    async pwrcTransfers(
      days = 7,
      limit = 100,
    ) {
      const window =
        queryWindow(
          days,
          limit,
        );

      return await get<
        PwrcTransferRow
      >(
        `/api/v1/data/solana/pwrc/transfers?days=${window.days}&limit=${window.limit}`,
      );
    },

    async pwrcVolume(
      days = 7,
    ) {
      const window =
        queryWindow(
          days,
          100,
        );

      return await get<
        PwrcVolumeRow
      >(
        `/api/v1/data/solana/pwrc/volume?days=${window.days}&limit=100`,
      );
    },

    async pwrcInstructions(
      days = 7,
      limit = 100,
    ) {
      const window =
        queryWindow(
          days,
          limit,
        );

      return await get<
        PwrcInstructionRow
      >(
        `/api/v1/data/solana/pwrc/instructions?days=${window.days}&limit=${window.limit}`,
      );
    },

    async walletTransfers(
      wallet: string,
      {
        days = 7,
        limit = 100,
        pwrcOnly = false,
      } = {},
    ) {
      const window =
        queryWindow(
          days,
          limit,
        );

      return await get<
        PwrcTransferRow
      >(
        `/api/v1/data/solana/wallet/transfers?wallet=${encodeURIComponent(wallet)}&days=${window.days}&limit=${window.limit}&pwrcOnly=${pwrcOnly}`,
      );
    },
  };
}

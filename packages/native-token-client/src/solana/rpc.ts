import axios, {
  type AxiosInstance,
} from "axios";
import {
  assertSolanaAddress,
} from "../validation/solana.js";

export interface RpcRequest {
  method: string;
  params?: readonly unknown[];
}

export class PowerChainRpcClient {
  readonly endpoint: string;
  readonly #http: AxiosInstance;
  #id = 0;

  constructor(input: {
    endpoint: string;
    timeoutMs?: number;
  }) {
    const url = new URL(input.endpoint);

    if (
      url.protocol !== "https:" &&
      !["127.0.0.1", "localhost"].includes(
        url.hostname,
      )
    ) {
      throw new Error(
        "POWERCHAIN_RPC_REQUIRES_HTTPS",
      );
    }

    this.endpoint = url.toString();

    this.#http = axios.create({
      baseURL: this.endpoint,
      timeout: input.timeoutMs ?? 10_000,
      headers: {
        "content-type": "application/json",
      },
      maxBodyLength: 256_000,
      maxContentLength: 2_000_000,
    });
  }

  async request<T>(
    method: string,
    params: readonly unknown[] = [],
  ): Promise<T> {
    if (
      !/^[A-Za-z][A-Za-z0-9_]*$/.test(
        method,
      )
    ) {
      throw new Error(
        "POWERCHAIN_RPC_METHOD_INVALID",
      );
    }

    const id = ++this.#id;
    const response =
      await this.#http.post("", {
        jsonrpc: "2.0",
        id,
        method,
        params,
      });

    if (
      !response.data ||
      response.data.jsonrpc !== "2.0" ||
      response.data.id !== id
    ) {
      throw new Error(
        "POWERCHAIN_RPC_RESPONSE_INVALID",
      );
    }

    if (response.data.error) {
      throw new Error(
        `POWERCHAIN_RPC_ERROR:${
          response.data.error.code ?? "unknown"
        }:${
          response.data.error.message ??
          "unknown error"
        }`,
      );
    }

    return response.data.result as T;
  }

  async batch<T = unknown>(
    requests: readonly RpcRequest[],
  ): Promise<T[]> {
    if (
      requests.length < 1 ||
      requests.length > 20
    ) {
      throw new Error(
        "POWERCHAIN_RPC_BATCH_SIZE_INVALID",
      );
    }

    const payload = requests.map(
      (request) => ({
        jsonrpc: "2.0",
        id: ++this.#id,
        method: request.method,
        params: request.params ?? [],
      }),
    );

    const response =
      await this.#http.post("", payload);

    if (!Array.isArray(response.data)) {
      throw new Error(
        "POWERCHAIN_RPC_BATCH_RESPONSE_INVALID",
      );
    }

    const entries = new Map(
      response.data.map(
        (entry: any) => [
          entry.id,
          entry,
        ],
      ),
    );

    return payload.map((request) => {
      const entry = entries.get(request.id);

      if (!entry) {
        throw new Error(
          "POWERCHAIN_RPC_BATCH_ENTRY_MISSING",
        );
      }

      if (entry.error) {
        throw new Error(
          `POWERCHAIN_RPC_ERROR:${
            entry.error.code ?? "unknown"
          }:${
            entry.error.message ??
            "unknown error"
          }`,
        );
      }

      return entry.result as T;
    });
  }

  getTokenSupply(mint: string) {
    return this.request<{
      context: { slot: number };
      value: {
        amount: string;
        decimals: number;
        uiAmountString: string;
      };
    }>("getTokenSupply", [
      assertSolanaAddress(mint),
      { commitment: "finalized" },
    ]);
  }
}

import {
  buildHeliusApiUrl,
  buildHeliusRpcUrl,
  buildHeliusWebSocketUrl,
  type HeliusNetwork,
} from "@powerchain/protocol/helius";

const READ_RPC_METHODS =
  new Set([
    "getAccountInfo",
    "getBalance",
    "getBlockHeight",
    "getEpochInfo",
    "getGenesisHash",
    "getLatestBlockhash",
    "getMultipleAccounts",
    "getProgramAccounts",
    "getSignaturesForAddress",
    "getSignatureStatuses",
    "getSlot",
    "getTokenAccountBalance",
    "getTokenAccountsByOwner",
    "getTokenSupply",
    "getTransaction",
    "getTransactionCount",
    "getVersion",
  ]);

const DAS_METHODS =
  new Set([
    "getAsset",
    "getAssetBatch",
    "getAssetsByOwner",
    "getTokenAccounts",
    "searchAssets",
  ]);

export type HeliusPriorityLevel =
  | "Min"
  | "Low"
  | "Medium"
  | "High"
  | "VeryHigh";

export interface HeliusPriorityFeeEstimateInput {
  transactionBase64?:
    string;
  accountKeys?:
    readonly string[];
  priorityLevel?:
    HeliusPriorityLevel;
  recommended?:
    boolean;
}

export interface HeliusRetryPolicy {
  maxAttempts:
    number;
  baseDelayMs:
    number;
  maxDelayMs:
    number;
  rateLimitDelayMs:
    number;
}

export interface HeliusRequestOptions {
  signal?:
    AbortSignal;
}

export interface HeliusClientConfig {
  apiKey:
    string;
  network:
    HeliusNetwork;
  timeoutMs?:
    number;
  maxResponseBytes?:
    number;
  retryPolicy?:
    Partial<
      HeliusRetryPolicy
    >;
  fetchImpl?:
    typeof fetch;
  sleepImpl?:
    (
      ms:
        number,
    ) =>
      Promise<void>;
  nowImpl?:
    () =>
      number;
}


const sharedCooldownUntil =
  new Map<
    HeliusNetwork,
    number
  >();

function retryAfterDelayMs(
  response:
    Response,
  now:
    number,
): number |
  null {
  const raw =
    response.headers
      .get(
        "retry-after",
      )
      ?.trim();

  if (!raw) {
    return null;
  }

  if (
    /^[0-9]+(?:\.[0-9]+)?$/.test(
      raw,
    )
  ) {
    const seconds =
      Number(
        raw,
      );

    if (
      Number.isFinite(
        seconds,
      )
    ) {
      return Math.min(
        60_000,
        Math.max(
          0,
          Math.ceil(
            seconds *
            1000,
          ),
        ),
      );
    }
  }

  const parsed =
    Date.parse(
      raw,
    );

  if (
    Number.isFinite(
      parsed,
    )
  ) {
    return Math.min(
      60_000,
      Math.max(
        0,
        parsed -
        now,
      ),
    );
  }

  return null;
}

const DEFAULT_RETRY_POLICY:
  HeliusRetryPolicy =
  {
    maxAttempts:
      4,
    baseDelayMs:
      250,
    maxDelayMs:
      4_000,
    rateLimitDelayMs:
      10_000,
  };

function assertRetryPolicy(
  policy:
    HeliusRetryPolicy,
): void {
  if (
    !Number.isSafeInteger(
      policy.maxAttempts,
    ) ||
    policy.maxAttempts <
      1 ||
    policy.maxAttempts >
      8
  ) {
    throw new Error(
      "PWRC_HELIUS_RETRY_ATTEMPTS_INVALID",
    );
  }

  for (const [
    value,
    code,
  ] of [
    [
      policy.baseDelayMs,
      "PWRC_HELIUS_RETRY_BASE_DELAY_INVALID",
    ],
    [
      policy.maxDelayMs,
      "PWRC_HELIUS_RETRY_MAX_DELAY_INVALID",
    ],
    [
      policy.rateLimitDelayMs,
      "PWRC_HELIUS_RATE_LIMIT_DELAY_INVALID",
    ],
  ] as const) {
    if (
      !Number.isSafeInteger(
        value,
      ) ||
      value <
        0 ||
      value >
        60_000
    ) {
      throw new Error(
        code,
      );
    }
  }

  if (
    policy.maxDelayMs <
      policy.baseDelayMs
  ) {
    throw new Error(
      "PWRC_HELIUS_RETRY_DELAY_ORDER_INVALID",
    );
  }
}

function backoffDelay(
  attempt:
    number,
  policy:
    HeliusRetryPolicy,
): number {
  return Math.min(
    policy.maxDelayMs,
    policy.baseDelayMs *
      2 **
        Math.max(
          0,
          attempt -
            1,
        ),
  );
}

function sanitizeErrorMessage(
  error:
    unknown,
): string {
  if (
    error instanceof
      DOMException &&
    error.name ===
      "AbortError"
  ) {
    return "PWRC_HELIUS_TIMEOUT";
  }

  if (
    error instanceof
      Error &&
    /^PWRC_HELIUS_[A-Z0-9_]+$/.test(
      error.message,
    )
  ) {
    return error.message;
  }

  return "PWRC_HELIUS_REQUEST_FAILED";
}

export function createHeliusClient(
  config:
    HeliusClientConfig,
) {
  const rpcUrl =
    buildHeliusRpcUrl(
      config.network,
      config.apiKey,
    );
  const apiUrl =
    buildHeliusApiUrl(
      config.network,
      config.apiKey,
    );
  const websocketUrl =
    buildHeliusWebSocketUrl(
      config.network,
      config.apiKey,
    );
  const timeoutMs =
    config.timeoutMs ??
    10_000;

  const maxResponseBytes =
    config.maxResponseBytes ??
    2_000_000;

  if (
    !Number.isSafeInteger(
      maxResponseBytes,
    ) ||
    maxResponseBytes <
      1_024 ||
    maxResponseBytes >
      10_000_000
  ) {
    throw new Error(
      "PWRC_HELIUS_RESPONSE_SIZE_LIMIT_INVALID",
    );
  }

  let rpcRequestId =
    0;

  if (
    !Number.isSafeInteger(
      timeoutMs,
    ) ||
    timeoutMs <
      1_000 ||
    timeoutMs >
      60_000
  ) {
    throw new Error(
      "PWRC_HELIUS_TIMEOUT_INVALID",
    );
  }

  const retryPolicy = {
    ...DEFAULT_RETRY_POLICY,
    ...config.retryPolicy,
  };
  assertRetryPolicy(
    retryPolicy,
  );

  const fetchImpl =
    config.fetchImpl ??
    fetch;
  const sleepImpl =
    config.sleepImpl ??
    (
      async (
        ms:
          number,
      ) =>
        new Promise<void>(
          (resolve) =>
            setTimeout(
              resolve,
              ms,
            ),
        )
    );

  const nowImpl =
    config.nowImpl ??
    Date.now;

  async function waitForSharedCooldown() {
    const until =
      sharedCooldownUntil.get(
        config.network,
      ) ??
      0;
    const delay =
      until -
      nowImpl();

    if (
      delay >
        0
    ) {
      await sleepImpl(
        delay,
      );
    }
  }

  function enterSharedCooldown(
    delayMs:
      number,
  ) {
    const until =
      nowImpl() +
      delayMs;
    const current =
      sharedCooldownUntil.get(
        config.network,
      ) ??
      0;

    if (
      until >
        current
    ) {
      sharedCooldownUntil.set(
        config.network,
        until,
      );
    }
  }

  async function request(
    url:
      string,
    method:
      string,
    params:
      unknown,
    options:
      HeliusRequestOptions =
      {},
  ) {
    let lastError =
      "PWRC_HELIUS_REQUEST_FAILED";

    if (
      options.signal?.aborted
    ) {
      throw new Error(
        "PWRC_HELIUS_CANCELLED",
      );
    }

    for (
      let attempt =
        1;
      attempt <=
        retryPolicy.maxAttempts;
      attempt +=
        1
    ) {
      await waitForSharedCooldown();

      const controller =
        new AbortController();
      let timeoutFired =
        false;
      const abortFromCaller =
        () =>
          controller.abort();
      options.signal?.addEventListener(
        "abort",
        abortFromCaller,
        {
          once:
            true,
        },
      );
      const timer =
        setTimeout(
          () => {
            timeoutFired =
              true;
            controller.abort();
          },
          timeoutMs,
        );

      try {
        const response =
          await fetchImpl(
            url,
            {
              method:
                "POST",
              headers: {
                "content-type":
                  "application/json",
              },
              body:
                JSON.stringify({
                  jsonrpc:
                    "2.0",
                  id:
                    ++rpcRequestId,
                  method,
                  params,
                }),
              signal:
                controller.signal,
            },
          );

        if (
          response.status ===
            429
        ) {
          lastError =
            "PWRC_HELIUS_RATE_LIMITED";

          const retryAfterMs =
            retryAfterDelayMs(
              response,
              nowImpl(),
            );
          const cooldownMs =
            Math.min(
              60_000,
              Math.max(
                retryPolicy
                  .rateLimitDelayMs,
                retryAfterMs ??
                  0,
              ),
            );

          enterSharedCooldown(
            cooldownMs,
          );

          if (
            attempt <
              retryPolicy.maxAttempts
          ) {
            await waitForSharedCooldown();
            continue;
          }

          throw new Error(
            lastError,
          );
        }

        if (
          response.status ===
            408 ||
          (
            response.status >=
              500 &&
            response.status <=
              599
          )
        ) {
          lastError =
            `PWRC_HELIUS_HTTP_${response.status}`;

          if (
            attempt <
              retryPolicy.maxAttempts
          ) {
            await sleepImpl(
              backoffDelay(
                attempt,
                retryPolicy,
              ),
            );
            continue;
          }

          throw new Error(
            lastError,
          );
        }

        if (!response.ok) {
          throw new Error(
            `PWRC_HELIUS_HTTP_${response.status}`,
          );
        }

        const contentLength =
          Number(
            response.headers
              .get(
                "content-length",
              ) ??
            "0",
          );

        if (
          Number.isFinite(
            contentLength,
          ) &&
          contentLength >
            maxResponseBytes
        ) {
          throw new Error(
            "PWRC_HELIUS_RESPONSE_TOO_LARGE",
          );
        }

        let responseText:
          string;

        try {
          responseText =
            await response.text();
        } catch {
          throw new Error(
            "PWRC_HELIUS_RESPONSE_INVALID",
          );
        }

        if (
          new TextEncoder()
            .encode(
              responseText,
            )
            .byteLength >
            maxResponseBytes
        ) {
          throw new Error(
            "PWRC_HELIUS_RESPONSE_TOO_LARGE",
          );
        }

        let payload:
          any;

        try {
          payload =
            JSON.parse(
              responseText,
            );
        } catch {
          throw new Error(
            "PWRC_HELIUS_RESPONSE_INVALID",
          );
        }

        if (
          payload &&
          typeof payload ===
            "object" &&
          "error" in payload &&
          payload.error
        ) {
          throw new Error(
            "PWRC_HELIUS_RPC_ERROR",
          );
        }

        return payload.result;
      } catch (error) {
        if (
          options.signal?.aborted &&
          !timeoutFired
        ) {
          lastError =
            "PWRC_HELIUS_CANCELLED";
        } else {
          lastError =
            sanitizeErrorMessage(
              error,
            );
        }

        if (
          attempt <
            retryPolicy.maxAttempts &&
          (
            lastError ===
              "PWRC_HELIUS_TIMEOUT" ||
            lastError ===
              "PWRC_HELIUS_REQUEST_FAILED"
          )
        ) {
          await sleepImpl(
            backoffDelay(
              attempt,
              retryPolicy,
            ),
          );
          continue;
        }

        throw new Error(
          lastError,
        );
      } finally {
        clearTimeout(
          timer,
        );
        options.signal?.removeEventListener(
          "abort",
          abortFromCaller,
        );
      }
    }

    throw new Error(
      lastError,
    );
  }

  return {
    network:
      config.network,
    endpointFamily:
      "helius" as const,
    retryPolicy: {
      ...retryPolicy,
    },
    toJSON() {
      return {
        network:
          config.network,
        endpointFamily:
          "helius",
        retryPolicy: {
          ...retryPolicy,
        },
        maxResponseBytes,
        secretsExposed:
          false,
      };
    },

    async rpcRead(
      method:
        string,
      params:
        unknown[] =
        [],
      options:
        HeliusRequestOptions =
        {},
    ) {
      if (
        !READ_RPC_METHODS.has(
          method,
        )
      ) {
        throw new Error(
          "PWRC_HELIUS_RPC_METHOD_NOT_ALLOWED",
        );
      }

      return request(
        rpcUrl,
        method,
        params,
        options,
      );
    },


async priorityFeeEstimate(
  input:
    HeliusPriorityFeeEstimateInput,
  options:
    HeliusRequestOptions =
    {},
): Promise<number> {
  const transaction =
    input.transactionBase64
      ?.trim();
  const accountKeys =
    input.accountKeys ??
    [];

  if (
    !transaction &&
    accountKeys.length ===
      0
  ) {
    throw new Error(
      "PWRC_HELIUS_PRIORITY_FEE_INPUT_REQUIRED",
    );
  }

  if (
    transaction &&
    (
      transaction.length >
        20_000 ||
      !/^[A-Za-z0-9+/=]+$/.test(
        transaction,
      )
    )
  ) {
    throw new Error(
      "PWRC_HELIUS_PRIORITY_FEE_TRANSACTION_INVALID",
    );
  }

  if (
    accountKeys.length >
      128
  ) {
    throw new Error(
      "PWRC_HELIUS_PRIORITY_FEE_ACCOUNT_LIMIT",
    );
  }

  const result =
    await request(
      rpcUrl,
      "getPriorityFeeEstimate",
      [
        {
          ...(transaction
            ? {
                transaction,
                transactionEncoding:
                  "Base64",
              }
            : {
                accountKeys,
              }),
          options: {
            priorityLevel:
              input.priorityLevel ??
              "Medium",
            recommended:
              input.recommended ??
              true,
          },
        },
      ],
      options,
    );

  const estimate =
    Number(
      result
        ?.priorityFeeEstimate,
    );

  if (
    !Number.isFinite(
      estimate,
    ) ||
    estimate <
      0
  ) {
    throw new Error(
      "PWRC_HELIUS_PRIORITY_FEE_RESPONSE_INVALID",
    );
  }

  return estimate;
},

    async das(
      method:
        string,
      params:
        Record<
          string,
          unknown
        >,
      options:
        HeliusRequestOptions =
        {},
    ) {
      if (
        !DAS_METHODS.has(
          method,
        )
      ) {
        throw new Error(
          "PWRC_HELIUS_DAS_METHOD_NOT_ALLOWED",
        );
      }

      return request(
        apiUrl,
        method,
        params,
        options,
      );
    },
  };
}

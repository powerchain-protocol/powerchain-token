import {
  PWRC_CANONICAL_MINT,
  buildMintVolumeQuery,
  buildRecentMintTransfersQuery,
  buildToken2022InstructionsQuery,
  buildTransferInstructionContextQuery,
  buildWalletTransfersQuery,
  parseCdpQueryWindow,
  runCdpSqlQuery,
} from "./cdp-solana-sql.mjs";

export function isCdpRoute(
  pathname,
) {
  return pathname.startsWith(
    "/api/v1/data/solana/",
  );
}

function timeoutMs(
  env,
) {
  const raw =
    env[
      "CDP_SQL_API_TIMEOUT_MS"
    ] ??
    "10000";

  if (!/^\d+$/.test(raw)) {
    throw new Error(
      "PWRC_CDP_SQL_TIMEOUT_INVALID",
    );
  }

  const parsed =
    Number(raw);

  if (
    !Number.isSafeInteger(
      parsed,
    ) ||
    parsed < 1_000 ||
    parsed > 30_000
  ) {
    throw new Error(
      "PWRC_CDP_SQL_TIMEOUT_INVALID",
    );
  }

  return parsed;
}


function cacheMaxAgeMs(
  env,
) {
  const raw =
    env[
      "CDP_SQL_API_CACHE_MAX_AGE_MS"
    ] ??
    "15000";

  if (!/^\d+$/.test(raw)) {
    throw new Error(
      "PWRC_CDP_SQL_CACHE_MAX_AGE_INVALID",
    );
  }

  const parsed =
    Number(raw);

  if (
    !Number.isSafeInteger(
      parsed,
    ) ||
    parsed < 0 ||
    parsed > 900_000
  ) {
    throw new Error(
      "PWRC_CDP_SQL_CACHE_MAX_AGE_INVALID",
    );
  }

  return parsed;
}

export async function handleCdpRoute(
  url,
  {
    env =
      process.env,
    runQuery =
      runCdpSqlQuery,
  } = {},
) {
  const days =
    url.searchParams.get(
      "days",
    );
  const limit =
    url.searchParams.get(
      "limit",
    );

  const window =
    parseCdpQueryWindow({
      days,
      limit,
    });

  const common = {
    mint:
      PWRC_CANONICAL_MINT,
    days:
      window.days,
    limit:
      window.limit,
  };

  let query;
  let kind;

  switch (url.pathname) {
    case "/api/v1/data/solana/pwrc/transfers":
      kind =
        "pwrc-transfers";
      query =
        buildRecentMintTransfersQuery(
          common,
        );
      break;

    case "/api/v1/data/solana/pwrc/volume":
      kind =
        "pwrc-volume";
      query =
        buildMintVolumeQuery(
          common,
        );
      break;

    case "/api/v1/data/solana/pwrc/instructions":
      kind =
        "pwrc-token-2022-instructions";
      query =
        buildToken2022InstructionsQuery(
          common,
        );
      break;

    case "/api/v1/data/solana/pwrc/transfer-context":
      kind =
        "pwrc-transfer-instruction-context";
      query =
        buildTransferInstructionContextQuery(
          common,
        );
      break;

    case "/api/v1/data/solana/wallet/transfers": {
      const wallet =
        url.searchParams.get(
          "wallet",
        );

      if (!wallet) {
        throw new Error(
          "PWRC_WALLET_REQUIRED",
        );
      }

      kind =
        "wallet-transfers";
      query =
        buildWalletTransfersQuery({
          wallet,
          mint:
            url.searchParams.get(
              "pwrcOnly",
            ) === "true"
              ? PWRC_CANONICAL_MINT
              : null,
          days:
            window.days,
          limit:
            window.limit,
        });
      break;
    }

    default:
      return null;
  }

  const result =
    await runQuery(
      query,
      {
        env,
        timeoutMs:
          timeoutMs(env),
        cacheMaxAgeMs:
          cacheMaxAgeMs(env),
      },
    );

  return {
    version:
      "1.0.0",
    provider:
      "coinbase-cdp-sql-api",
    network:
      "solana-mainnet",
    kind,
    queryWindow: {
      days:
        window.days,
      limit:
        window.limit,
    },
    canonicalMint:
      PWRC_CANONICAL_MINT,
    metadata:
      result.metadata,
    schema:
      result.schema ??
      null,
    result:
      result.result,
  };
}

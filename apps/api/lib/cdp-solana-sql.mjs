import {
  assertSolanaAddress,
} from "./fees.mjs";

export const CDP_SQL_API_ENDPOINT =
  "https://api.cdp.coinbase.com/platform/v2/data/query/run";

export const PWRC_CANONICAL_MINT =
  "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc";

export const SOLANA_TOKEN_PROGRAM_ID =
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

export const SOLANA_TOKEN_2022_PROGRAM_ID =
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";

export const SOLANA_SYSTEM_PROGRAM_ID =
  "11111111111111111111111111111111";

const MAX_DAYS =
  90;
const MAX_LIMIT =
  1_000;

function integer(
  value,
  {
    fallback,
    min,
    max,
    code,
  },
) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return fallback;
  }

  if (!/^\d+$/.test(String(value))) {
    throw new Error(code);
  }

  const parsed =
    Number(value);

  if (
    !Number.isSafeInteger(parsed) ||
    parsed < min ||
    parsed > max
  ) {
    throw new Error(code);
  }

  return parsed;
}

export function parseCdpQueryWindow({
  days,
  limit,
} = {}) {
  return {
    days:
      integer(days, {
        fallback:
          7,
        min:
          1,
        max:
          MAX_DAYS,
        code:
          "PWRC_CDP_DAYS_INVALID",
      }),
    limit:
      integer(limit, {
        fallback:
          100,
        min:
          1,
        max:
          MAX_LIMIT,
        code:
          "PWRC_CDP_LIMIT_INVALID",
      }),
  };
}

function assertMint(
  mint,
) {
  const normalized =
    assertSolanaAddress(
      mint,
    );

  return normalized;
}

function quotedAddress(
  value,
) {
  // Base58 validation guarantees there are no SQL metacharacters.
  return `'${assertSolanaAddress(value)}'`;
}

function intervalDays(
  days,
) {
  return `${days} DAY`;
}

export function buildRecentMintTransfersQuery({
  mint =
    PWRC_CANONICAL_MINT,
  days,
  limit,
} = {}) {
  const window =
    parseCdpQueryWindow({
      days,
      limit,
    });
  const validatedMint =
    assertMint(mint);

  return `
SELECT
  block_time,
  tx_id,
  source,
  destination,
  source_owner,
  destination_owner,
  mint,
  amount,
  instruction_id
FROM solana.transfers
WHERE mint = '${validatedMint}'
  AND block_time >= now() - INTERVAL ${intervalDays(window.days)}
  AND action = 1
ORDER BY block_time DESC
LIMIT ${window.limit};
`.trim();
}

export function buildMintVolumeQuery({
  mint =
    PWRC_CANONICAL_MINT,
  days,
} = {}) {
  const window =
    parseCdpQueryWindow({
      days,
      limit:
        100,
    });
  const validatedMint =
    assertMint(mint);

  return `
SELECT
  toDate(block_time) AS day,
  count() AS transfer_count,
  sum(amount) AS volume_base_units
FROM solana.transfers
WHERE mint = '${validatedMint}'
  AND block_time >= now() - INTERVAL ${intervalDays(window.days)}
  AND action = 1
GROUP BY day
ORDER BY day DESC;
`.trim();
}

export function buildWalletTransfersQuery({
  wallet,
  mint =
    null,
  days,
  limit,
}) {
  const validatedWallet =
    quotedAddress(wallet);
  const window =
    parseCdpQueryWindow({
      days,
      limit,
    });

  const mintClause =
    mint
      ? `\n  AND mint = '${assertMint(mint)}'`
      : "";

  return `
SELECT
  block_time,
  tx_id,
  mint,
  source,
  destination,
  source_owner,
  destination_owner,
  amount,
  instruction_id
FROM solana.transfers
WHERE (
    source_owner = ${validatedWallet}
    OR destination_owner = ${validatedWallet}
  )
  AND block_time >= now() - INTERVAL ${intervalDays(window.days)}
  AND action = 1${mintClause}
ORDER BY block_time DESC
LIMIT ${window.limit};
`.trim();
}

export function buildToken2022InstructionsQuery({
  mint =
    PWRC_CANONICAL_MINT,
  days,
  limit,
} = {}) {
  const window =
    parseCdpQueryWindow({
      days,
      limit,
    });
  const validatedMint =
    assertMint(mint);

  // account_owners/mint-specific schema fields may evolve during beta.
  // Join through transfers for a stable PWRC mint filter instead of assuming
  // a mint column exists directly on every instruction row.
  return `
SELECT
  i.block_time,
  i.tx_id,
  i.instruction_id,
  i.instruction_name,
  i.executing_account,
  i.accounts,
  i.account_owners,
  i.args
FROM solana.instructions AS i
JOIN solana.transfers AS t
  ON i.instruction_id = t.instruction_id
WHERE t.mint = '${validatedMint}'
  AND i.executing_account = '${SOLANA_TOKEN_2022_PROGRAM_ID}'
  AND i.instruction_name IN ('transfer', 'transferChecked')
  AND i.block_time >= now() - INTERVAL ${intervalDays(window.days)}
  AND i.action = 1
  AND t.action = 1
ORDER BY i.block_time DESC
LIMIT ${window.limit};
`.trim();
}

export function buildTransferInstructionContextQuery({
  mint =
    PWRC_CANONICAL_MINT,
  days,
  limit,
} = {}) {
  const window =
    parseCdpQueryWindow({
      days,
      limit,
    });
  const validatedMint =
    assertMint(mint);

  return `
SELECT
  t.block_time,
  t.tx_id,
  t.instruction_id,
  t.mint,
  t.source_owner,
  t.destination_owner,
  t.amount,
  i.instruction_name,
  i.executing_account,
  i.accounts,
  i.args
FROM solana.transfers AS t
JOIN solana.instructions AS i
  ON t.instruction_id = i.instruction_id
WHERE t.mint = '${validatedMint}'
  AND t.block_time >= now() - INTERVAL ${intervalDays(window.days)}
  AND t.action = 1
  AND i.action = 1
ORDER BY t.block_time DESC
LIMIT ${window.limit};
`.trim();
}

function bearerToken(
  env,
) {
  const value =
    env[
      "CDP_SQL_API_BEARER_TOKEN"
    ]?.trim() ||
    env[
      "CDP_SQL_API_TOKEN"
    ]?.trim();

  if (!value) {
    throw new Error(
      "PWRC_CDP_SQL_API_BEARER_TOKEN_REQUIRED",
    );
  }

  return value;
}

function endpoint(
  env,
) {
  const raw =
    env[
      "CDP_SQL_API_URL"
    ]?.trim() ||
    CDP_SQL_API_ENDPOINT;

  let url;

  try {
    url =
      new URL(raw);
  } catch {
    throw new Error(
      "PWRC_CDP_SQL_API_URL_INVALID",
    );
  }

  if (
    url.protocol !==
      "https:"
  ) {
    throw new Error(
      "PWRC_CDP_SQL_API_HTTPS_REQUIRED",
    );
  }

  if (
    url.hostname !==
      "api.cdp.coinbase.com" ||
    url.pathname !==
      "/platform/v2/data/query/run"
  ) {
    throw new Error(
      "PWRC_CDP_SQL_API_ENDPOINT_FORBIDDEN",
    );
  }

  url.search = "";
  url.hash = "";

  return url.toString();
}

export async function runCdpSqlQuery(
  sql,
  {
    env =
      process.env,
    timeoutMs =
      10_000,
    cacheMaxAgeMs =
      15_000,
    fetchImpl =
      fetch,
  } = {},
) {
  if (
    typeof sql !==
      "string" ||
    !sql.trim()
      .toUpperCase()
      .startsWith(
        "SELECT",
      )
  ) {
    throw new Error(
      "PWRC_CDP_SQL_READ_ONLY_REQUIRED",
    );
  }

  if (
    sql.length >
      10_000
  ) {
    throw new Error(
      "PWRC_CDP_SQL_QUERY_TOO_LONG",
    );
  }

  if (
    !Number.isSafeInteger(
      timeoutMs,
    ) ||
    timeoutMs < 1_000 ||
    timeoutMs > 30_000
  ) {
    throw new Error(
      "PWRC_CDP_SQL_TIMEOUT_INVALID",
    );
  }

  if (
    !Number.isSafeInteger(
      cacheMaxAgeMs,
    ) ||
    cacheMaxAgeMs < 0 ||
    cacheMaxAgeMs > 900_000
  ) {
    throw new Error(
      "PWRC_CDP_SQL_CACHE_MAX_AGE_INVALID",
    );
  }

  const response =
    await fetchImpl(
      endpoint(env),
      {
        method:
          "POST",
        headers: {
          authorization:
            `Bearer ${bearerToken(env)}`,
          "content-type":
            "application/json",
          accept:
            "application/json",
        },
        body:
          JSON.stringify({
            sql:
              sql.trim(),
            cache: {
              maxAgeMs:
                cacheMaxAgeMs,
            },
          }),
        signal:
          AbortSignal.timeout(
            timeoutMs,
          ),
      },
    );

  let payload;

  try {
    payload =
      await response.json();
  } catch {
    throw new Error(
      `PWRC_CDP_SQL_RESPONSE_INVALID:${response.status}`,
    );
  }

  if (!response.ok) {
    const code =
      payload?.error?.code ??
      payload?.code ??
      response.status;

    throw new Error(
      `PWRC_CDP_SQL_REQUEST_FAILED:${String(code)}`,
    );
  }

  if (
    !payload ||
    !Array.isArray(
      payload.result,
    )
  ) {
    throw new Error(
      "PWRC_CDP_SQL_RESULT_INVALID",
    );
  }

  return {
    metadata:
      payload.metadata ??
      null,
    schema:
      payload.schema ??
      null,
    result:
      payload.result,
  };
}

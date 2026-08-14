import {
  CDP_SQL_API_ENDPOINT,
  PWRC_CANONICAL_MINT,
  SOLANA_TOKEN_2022_PROGRAM_ID,
  buildMintVolumeQuery,
  buildRecentMintTransfersQuery,
  buildToken2022InstructionsQuery,
  buildTransferInstructionContextQuery,
  buildWalletTransfersQuery,
  parseCdpQueryWindow,
  runCdpSqlQuery,
} from "../../apps/api/lib/cdp-solana-sql.mjs";
import {
  handleCdpRoute,
} from "../../apps/api/lib/cdp-routes.mjs";

const failures = [];

async function expectReject(
  promise,
  code,
) {
  try {
    await promise;
    failures.push(
      `expected-reject:${code}`,
    );
  } catch (error) {
    if (
      !(error instanceof Error) ||
      error.message !== code
    ) {
      failures.push(
        `wrong-reject:${code}:${error instanceof Error ? error.message : "unknown"}`,
      );
    }
  }
}

function expectThrow(
  fn,
  code,
) {
  try {
    fn();
    failures.push(
      `expected-throw:${code}`,
    );
  } catch (error) {
    if (
      !(error instanceof Error) ||
      error.message !== code
    ) {
      failures.push(
        `wrong-error:${code}:${error instanceof Error ? error.message : "unknown"}`,
      );
    }
  }
}

const window =
  parseCdpQueryWindow({
    days:
      "7",
    limit:
      "100",
  });

if (
  window.days !== 7 ||
  window.limit !== 100
) {
  failures.push(
    "window:valid",
  );
}

expectThrow(
  () =>
    parseCdpQueryWindow({
      days:
        "91",
    }),
  "PWRC_CDP_DAYS_INVALID",
);

expectThrow(
  () =>
    parseCdpQueryWindow({
      limit:
        "1001",
    }),
  "PWRC_CDP_LIMIT_INVALID",
);

const transfers =
  buildRecentMintTransfersQuery({
    days:
      7,
    limit:
      50,
  });

for (const invariant of [
  "FROM solana.transfers",
  `mint = '${PWRC_CANONICAL_MINT}'`,
  "block_time >= now() - INTERVAL 7 DAY",
  "action = 1",
  "source_owner",
  "destination_owner",
  "instruction_id",
  "LIMIT 50",
]) {
  if (!transfers.includes(invariant)) {
    failures.push(
      `transfers:${invariant}`,
    );
  }
}

const volume =
  buildMintVolumeQuery({
    days:
      7,
  });

for (const invariant of [
  "toDate(block_time)",
  "count() AS transfer_count",
  "sum(amount) AS volume_base_units",
  `mint = '${PWRC_CANONICAL_MINT}'`,
  "action = 1",
]) {
  if (!volume.includes(invariant)) {
    failures.push(
      `volume:${invariant}`,
    );
  }
}

const wallet =
  "11111111111111111111111111111111";
const walletSql =
  buildWalletTransfersQuery({
    wallet,
    mint:
      PWRC_CANONICAL_MINT,
    days:
      7,
    limit:
      25,
  });

for (const invariant of [
  `source_owner = '${wallet}'`,
  `destination_owner = '${wallet}'`,
  `mint = '${PWRC_CANONICAL_MINT}'`,
  "block_time >= now() - INTERVAL 7 DAY",
  "action = 1",
]) {
  if (!walletSql.includes(invariant)) {
    failures.push(
      `wallet:${invariant}`,
    );
  }
}

expectThrow(
  () =>
    buildWalletTransfersQuery({
      wallet:
        "11111' OR 1=1 --",
      days:
        7,
      limit:
        10,
    }),
  "PWRC_SOLANA_ADDRESS_INVALID",
);

const instructions =
  buildToken2022InstructionsQuery({
    days:
      7,
    limit:
      30,
  });

for (const invariant of [
  "FROM solana.instructions AS i",
  "JOIN solana.transfers AS t",
  "ON i.instruction_id = t.instruction_id",
  `t.mint = '${PWRC_CANONICAL_MINT}'`,
  `i.executing_account = '${SOLANA_TOKEN_2022_PROGRAM_ID}'`,
  "i.instruction_name IN ('transfer', 'transferChecked')",
  "i.action = 1",
  "t.action = 1",
]) {
  if (!instructions.includes(invariant)) {
    failures.push(
      `instructions:${invariant}`,
    );
  }
}

const context =
  buildTransferInstructionContextQuery({
    days:
      7,
    limit:
      30,
  });

if (
  !context.includes(
    "ON t.instruction_id = i.instruction_id",
  )
) {
  failures.push(
    "context:instruction-id-join",
  );
}

let observedRequest =
  null;

const mockFetch =
  async (
    url,
    options,
  ) => {
    observedRequest = {
      url,
      options,
    };

    return {
      ok:
        true,
      status:
        200,
      async json() {
        return {
          metadata: {
            cached:
              false,
            rowCount:
              1,
          },
          result: [
            {
              tx_id:
                "abc",
            },
          ],
        };
      },
    };
  };

const result =
  await runCdpSqlQuery(
    transfers,
    {
      env: {
        CDP_SQL_API_BEARER_TOKEN:
          "server-secret-test-token",
      },
      timeoutMs:
        5_000,
      fetchImpl:
        mockFetch,
    },
  );

if (
  result.result.length !==
    1 ||
  observedRequest?.url !==
    CDP_SQL_API_ENDPOINT ||
  observedRequest
    ?.options
    ?.headers
    ?.authorization !==
    "Bearer server-secret-test-token"
) {
  failures.push(
    "client:request",
  );
}

const requestBody =
  JSON.parse(
    observedRequest
      ?.options
      ?.body ??
      "{}",
  );

if (
  requestBody.sql !==
    transfers
) {
  failures.push(
    "client:sql-body",
  );
}

expectThrow(
  () => {
    if (
      !"DELETE FROM solana.transfers"
        .trim()
        .toUpperCase()
        .startsWith(
          "SELECT",
        )
    ) {
      throw new Error(
        "PWRC_CDP_SQL_READ_ONLY_REQUIRED",
      );
    }
  },
  "PWRC_CDP_SQL_READ_ONLY_REQUIRED",
);

const routeUrl =
  new URL(
    "http://localhost/api/v1/data/solana/pwrc/transfers?days=3&limit=5",
  );

const routePayload =
  await handleCdpRoute(
    routeUrl,
    {
      env: {
        CDP_SQL_API_TIMEOUT_MS:
          "5000",
      },
      runQuery:
        async (sql) => ({
          metadata: {
            rowCount:
              0,
          },
          result:
            [],
          sql,
        }),
    },
  );

if (
  routePayload?.kind !==
    "pwrc-transfers" ||
  routePayload
    ?.queryWindow
    ?.days !==
    3 ||
  routePayload
    ?.queryWindow
    ?.limit !==
    5
) {
  failures.push(
    "route:pwrc-transfers",
  );
}

console.log(
  JSON.stringify(
    {
      ok:
        failures.length === 0,
      version:
        "1.0.0",
      tests: {
        boundedWindow:
          true,
        mintTransferQuery:
          true,
        mintVolumeQuery:
          true,
        walletOwnerQuery:
          true,
        token2022InstructionQuery:
          true,
        instructionJoin:
          true,
        sqlInjectionGuard:
          true,
        serverBearerCredential:
          true,
        routeDispatcher:
          true,
      },
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}

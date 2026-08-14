import fs from "node:fs";

const failures = [];

for (const file of [
  "config/cdp-sql.json",
  "apps/api/lib/cdp-solana-sql.mjs",
  "apps/api/lib/cdp-routes.mjs",
  "docs/CDP_SOLANA_SQL.md",
]) {
  if (!fs.existsSync(file)) {
    failures.push(
      `missing:${file}`,
    );
  }
}

const config =
  JSON.parse(
    fs.readFileSync(
      "config/cdp-sql.json",
      "utf8",
    ),
  );

if (
  config.version !==
    "1.0.0" ||
  config.network !==
    "solana-mainnet"
) {
  failures.push(
    "config:identity",
  );
}

if (
  config.canonicalMint !==
    "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc"
) {
  failures.push(
    "config:canonical-mint",
  );
}

if (
  config.tables
    ?.transfers !==
    "solana.transfers" ||
  config.tables
    ?.instructions !==
    "solana.instructions"
) {
  failures.push(
    "config:tables",
  );
}

if (
  config.programs
    ?.token2022 !==
    "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
) {
  failures.push(
    "config:token-2022",
  );
}

if (
  config.queryPolicy
    ?.maxDays !==
    90 ||
  config.queryPolicy
    ?.maxLimit !==
    1000 ||
  config.queryPolicy
    ?.rawSqlFromClient !==
    false
) {
  failures.push(
    "config:query-policy",
  );
}

const client =
  fs.readFileSync(
    "apps/api/lib/cdp-solana-sql.mjs",
    "utf8",
  );

for (const invariant of [
  "solana.transfers",
  "solana.instructions",
  "source_owner",
  "destination_owner",
  "instruction_id",
  "action = 1",
  "block_time >= now() - INTERVAL",
  "PWRC_CDP_SQL_READ_ONLY_REQUIRED",
  "PWRC_CDP_SQL_API_ENDPOINT_FORBIDDEN",
  "PWRC_CDP_SQL_QUERY_TOO_LONG",
  "api.cdp.coinbase.com",
  "CDP_SQL_API_BEARER_TOKEN",
]) {
  if (!client.includes(invariant)) {
    failures.push(
      `client:${invariant}`,
    );
  }
}

const api =
  fs.readFileSync(
    "apps/api/server.mjs",
    "utf8",
  );
const routes =
  fs.readFileSync(
    "apps/api/lib/cdp-routes.mjs",
    "utf8",
  );

for (const invariant of [
  "handleCdpRoute",
  "isCdpRoute",
]) {
  if (!api.includes(invariant)) {
    failures.push(
      `api:${invariant}`,
    );
  }
}

for (const invariant of [
  "/api/v1/data/solana/",
  "/api/v1/data/solana/pwrc/transfers",
  "/api/v1/data/solana/pwrc/volume",
  "/api/v1/data/solana/pwrc/instructions",
  "/api/v1/data/solana/pwrc/transfer-context",
  "/api/v1/data/solana/wallet/transfers",
]) {
  if (!routes.includes(invariant)) {
    failures.push(
      `routes:${invariant}`,
    );
  }
}

const env =
  fs.readFileSync(
    ".env.example",
    "utf8",
  );

if (
  !env.includes(
    "CDP_SQL_API_BEARER_TOKEN=",
  )
) {
  failures.push(
    "env:credential-template",
  );
}

const clientTree = [
  "apps/client",
];

for (const base of clientTree) {
  for (const path of walk(base)) {
    const source =
      fs.readFileSync(
        path,
        "utf8",
      );

    if (
      source.includes(
        "CDP_SQL_API_BEARER_TOKEN",
      ) ||
      source.includes(
        "CDP_SQL_API_TOKEN",
      )
    ) {
      failures.push(
        `browser-secret-reference:${path}`,
      );
    }
  }
}

function walk(base) {
  if (!fs.existsSync(base)) {
    return [];
  }

  const output = [];

  for (const entry of fs.readdirSync(base, {
    withFileTypes:
      true,
  })) {
    const path =
      `${base}/${entry.name}`;

    if (entry.isDirectory()) {
      output.push(
        ...walk(path),
      );
    } else {
      output.push(path);
    }
  }

  return output;
}

console.log(
  JSON.stringify(
    {
      ok:
        failures.length === 0,
      version:
        "1.0.0",
      provider:
        "coinbase-cdp-sql-api",
      network:
        "solana-mainnet",
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}

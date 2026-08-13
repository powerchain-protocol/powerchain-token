import fs from "node:fs";
import path from "node:path";

const failures = [];

function walk(dir) {
  const files = [];

  for (
    const entry of
    fs.readdirSync(
      dir,
      { withFileTypes: true },
    )
  ) {
    if (
      [
        "node_modules",
        "dist",
        ".git",
        "reports",
      ].includes(entry.name)
    ) {
      continue;
    }

    const full =
      path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walk(full));
    } else if (
      full.endsWith(".ts") ||
      full.endsWith(".tsx")
    ) {
      files.push(full);
    }
  }

  return files;
}

for (const file of walk(".")) {
  const source =
    fs.readFileSync(file, "utf8");

  if (
    /process\.env\.[A-Z][A-Z0-9_]*/.test(
      source,
    )
  ) {
    failures.push(
      `${file}:process-env-dot-access`,
    );
  }

  const jsonImports =
    source.match(
      /import\s+[^;\n]+from\s+"[^"]+\.json"\s*;/g,
    ) ?? [];

  for (const statement of jsonImports) {
    if (
      !statement.includes(
        'with { type: "json" }',
      )
    ) {
      failures.push(
        `${file}:json-import-attribute`,
      );
    }
  }
}

const solana =
  fs.readFileSync(
    "src/solana.ts",
    "utf8",
  );
for (const stale of [
  "env.PWRC_RPC_URL",
  "env.PWRC_MAINNET_RPC_URL",
  "env.NODE_ENV",
]) {
  if (solana.includes(stale)) {
    failures.push(
      `src/solana.ts:${stale}`,
    );
  }
}

const constants =
  fs.readFileSync(
    "src/constants.ts",
    "utf8",
  );
if (
  !constants.includes(
    "PWRC_CANONICAL_MINT_ADDRESS",
  )
) {
  failures.push(
    "src/constants.ts:canonical-mint-address-alias",
  );
}

const calendar =
  fs.readFileSync(
    "src/burn/calendar.ts",
    "utf8",
  );
if (
  !calendar.includes(
    "let id: bigint = PWRC_BURN_START_QUARTER_ID",
  )
) {
  failures.push(
    "src/burn/calendar.ts:bigint-literal-narrowing",
  );
}

const errors =
  fs.readFileSync(
    "src/common/errors.ts",
    "utf8",
  );
if (
  errors.includes(
    "readonly cause?: unknown",
  )
) {
  failures.push(
    "src/common/errors.ts:error-cause-override",
  );
}

const handler =
  fs.readFileSync(
    "src/handlers/read-handler.ts",
    "utf8",
  );
for (const stale of [
  "policy: options.retryPolicy",
  "signal: options.signal",
  "shouldRetry: options.shouldRetry",
]) {
  if (handler.includes(stale)) {
    failures.push(
      `src/handlers/read-handler.ts:${stale}`,
    );
  }
}

const nativeTest =
  fs.readFileSync(
    "tests/native-token-client.test.ts",
    "utf8",
  );
if (
  nativeTest.includes(
    "x.canonicalAmountBaseUnits",
  ) ||
  nativeTest.includes(
    "assert.equal(PWRC_TRANSFER_FEE_BPS, 0)",
  )
) {
  failures.push(
    "tests/native-token-client.test.ts:stale-model",
  );
}

const updateTest =
  fs.readFileSync(
    "tests/update-v2.test.ts",
    "utf8",
  );
for (const required of [
  "transferFeeBasisPoints: 250",
  "maximumTransferFeeTokens:",
]) {
  if (!updateTest.includes(required)) {
    failures.push(
      `tests/update-v2.test.ts:${required}`,
    );
  }
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  coveredCompilerErrors: [
    "TS4111",
    "TS2724",
    "TS2322",
    "TS4114",
    "TS2379",
    "TS1543",
    "TS2551",
    "TS2345",
  ],
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}

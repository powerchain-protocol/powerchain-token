import fs from "node:fs";

const failures = [];

for (const file of [
  "packages/cdp-user-wallet/package.json",
  "packages/cdp-user-wallet/src/index.ts",
  "packages/cdp-user-wallet/src/react.tsx",
  "config/cdp-user-wallet.json",
]) {
  if (!fs.existsSync(file)) {
    failures.push(
      `cdp-user-wallet:missing:${file}`,
    );
  }
}

const pkg =
  JSON.parse(
    fs.readFileSync(
      "packages/cdp-user-wallet/package.json",
      "utf8",
    ),
  );
const config =
  JSON.parse(
    fs.readFileSync(
      "config/cdp-user-wallet.json",
      "utf8",
    ),
  );
const tsconfig =
  JSON.parse(
    fs.readFileSync(
      "tsconfig.json",
      "utf8",
    ),
  );
const react =
  fs.readFileSync(
    "packages/cdp-user-wallet/src/react.tsx",
    "utf8",
  );
const example =
  fs.readFileSync(
    ".env.example",
    "utf8",
  );

for (const dependency of [
  "@coinbase/cdp-react",
  "@coinbase/cdp-core",
  "@coinbase/cdp-hooks",
]) {
  if (
    pkg.dependencies?.[dependency] !==
      "0.0.119"
  ) {
    failures.push(
      `cdp-user-wallet:dependency-version:${dependency}`,
    );
    continue;
  }
  if (!pkg.dependencies?.[dependency]) {
    failures.push(
      `cdp-user-wallet:dependency:${dependency}`,
    );
  }
}

if (
  ![
    "Node16",
    "NodeNext",
    "node16",
    "nodenext",
  ].includes(
    tsconfig.compilerOptions
      ?.moduleResolution,
  )
) {
  failures.push(
    "cdp-user-wallet:module-resolution",
  );
}

for (const invariant of [
  "CDPReactProvider",
  "solana",
  "createOnLogin",
  "useSolanaAddress",
  "AuthButton",
  "disableAnalytics",
]) {
  if (!react.includes(invariant)) {
    failures.push(
      `cdp-user-wallet:react:${invariant}`,
    );
  }
}

if (
  config.defaultEnabled !== false ||
  config.solana
    ?.createOnLogin !== true ||
  config.ethereum
    ?.createOnLogin !== false ||
  config.analytics
    ?.disabledByDefault !== true
) {
  failures.push(
    "cdp-user-wallet:config-policy",
  );
}

for (const required of [
  "POWERCHAIN_CDP_USER_WALLET_ENABLED=false",
  "POWERCHAIN_CDP_PROJECT_ID=",
  "POWERCHAIN_CDP_APP_NAME=PowerChain",
]) {
  if (!example.includes(required)) {
    failures.push(
      `cdp-user-wallet:env:${required}`,
    );
  }
}

for (const forbidden of [
  "CDP_SQL_API_BEARER_TOKEN",
  "CDP_SQL_API_TOKEN",
  "CDP_API_KEY_SECRET",
]) {
  if (
    react.includes(
      forbidden,
    )
  ) {
    failures.push(
      `cdp-user-wallet:browser-secret:${forbidden}`,
    );
  }
}

console.log(
  JSON.stringify(
    {
      ok:
        failures.length === 0,
      version:
        "1.0.0",
      optional:
        true,
      solanaCreateOnLogin:
        true,
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}

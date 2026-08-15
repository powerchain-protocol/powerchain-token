import fs from "node:fs";

const failures = [];

for (const file of [
  "packages/cdp-user-wallet/package.json",
  "packages/cdp-user-wallet/tsconfig.json",
  "packages/cdp-user-wallet/src/index.ts",
  "packages/cdp-user-wallet/src/react.tsx",
  "config/cdp-user-wallet.json",
]) {
  if (!fs.existsSync(file)) {
    failures.push(`cdp-user-wallet:missing:${file}`);
  }
}

const pkg = JSON.parse(
  fs.readFileSync(
    "packages/cdp-user-wallet/package.json",
    "utf8",
  ),
);
const config = JSON.parse(
  fs.readFileSync(
    "config/cdp-user-wallet.json",
    "utf8",
  ),
);
const cdpTs = JSON.parse(
  fs.readFileSync(
    "packages/cdp-user-wallet/tsconfig.json",
    "utf8",
  ),
);
const baseTs = JSON.parse(
  fs.readFileSync(
    "config/typescript/base.json",
    "utf8",
  ),
);
const react = fs.readFileSync(
  "packages/cdp-user-wallet/src/react.tsx",
  "utf8",
);
const example = fs.readFileSync(
  ".env.example",
  "utf8",
);

for (const dependency of [
  "@coinbase/cdp-core",
  "@coinbase/cdp-hooks",
]) {
  if (
    pkg.dependencies?.[dependency] !==
      "0.0.120"
  ) {
    failures.push(
      `cdp-user-wallet:dependency-version:${dependency}`,
    );
  }
}

if (
  pkg.dependencies?.[
    "@coinbase/cdp-react"
  ]
) {
  failures.push(
    "cdp-user-wallet:cdp-react-provider-dependency-not-required",
  );
}

if (
  cdpTs.extends !==
    "../../config/typescript/base.json" ||
  baseTs.compilerOptions
    ?.moduleResolution !==
    "NodeNext" ||
  baseTs.compilerOptions
    ?.module !==
    "NodeNext"
) {
  failures.push(
    "cdp-user-wallet:module-resolution",
  );
}

for (const invariant of [
  "CDPHooksProvider",
  "solana",
  "createOnLogin",
  "useSolanaAddress",
  "useIsSignedIn",
  "useSignInWithEmail",
  "useVerifyEmailOTP",
  "disableAnalytics",
]) {
  if (!react.includes(invariant)) {
    failures.push(
      `cdp-user-wallet:react:${invariant}`,
    );
  }
}

for (const forbidden of [
  "CDPReactProvider",
  "@coinbase/cdp-react",
]) {
  if (react.includes(forbidden)) {
    failures.push(
      `cdp-user-wallet:forbidden-provider:${forbidden}`,
    );
  }
}

if (
  config.defaultEnabled !== false ||
  config.solana?.createOnLogin !== true ||
  config.ethereum?.createOnLogin !== false ||
  config.analytics?.disabledByDefault !== true ||
  config.uiMode !== "custom-hooks"
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

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  optional: true,
  provider: "CDPHooksProvider",
  solanaCreateOnLogin: true,
  customAuthHooks: true,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}

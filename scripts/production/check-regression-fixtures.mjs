import fs from "node:fs";

const failures = [];

function text(file) {
  if (!fs.existsSync(file)) {
    failures.push(`missing:${file}`);
    return "";
  }
  return fs.readFileSync(file, "utf8");
}

const invariantTest =
  text("tests/invariants.test.ts");
if (
  !invariantTest.includes(
    '"TransferFeeConfig"',
  )
) {
  failures.push(
    "invariant-test-transfer-fee",
  );
}

const metadata =
  JSON.parse(
    text(
      "metadata/wpwrc.metadata.json",
    ) || "{}",
  );
if (
  metadata.name !==
    "Wrapped PowerChain"
) {
  failures.push(
    "wpwrc-name",
  );
}

const linksTest =
  text(
    "tests/official-links.test.ts",
  );
for (const url of [
  "https://bridge.powerchain.energy",
  "https://app.powerchain.energy",
]) {
  if (!linksTest.includes(url)) {
    failures.push(
      `official-links-test:${url}`,
    );
  }
}

const burnTest =
  text(
    "tests/burn-race-protection.test.ts",
  );
if (
  !burnTest.includes(
    '"980000000000"',
  )
) {
  failures.push(
    "burn-wrapped-ceiling-fixture",
  );
}

const relayerTest =
  text(
    "tests/relayer-hardening.test.ts",
  );
if (
  !relayerTest.includes(
    "suiWrappedSupplyBaseUnits: 1_000n",
  )
) {
  failures.push(
    "relayer-undercollateralized-fixture",
  );
}

const releaseTypes =
  text(
    "scripts/mainnet/release-state.d.mts",
  );
if (
  !releaseTypes.includes(
    "MainnetReleaseState",
  )
) {
  failures.push(
    "mainnet-release-state-declaration",
  );
}

console.log(
  JSON.stringify(
    {
      ok:
        failures.length === 0,
      version:
        "1.0.0",
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}

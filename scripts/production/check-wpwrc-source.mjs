import fs from "node:fs";

const failures = [];

const source =
  fs.readFileSync(
    "contracts/wpwrc/sources/wpwrc.move",
    "utf8",
  );

for (const invariant of [
  "BridgeController",
  "TreasuryCap<WPWRC>",
  "paused: true",
  "consumed_messages",
  "mint_from_solana",
  "burn_for_solana",
  "BridgeMinted",
  "BridgeBurned",
  "18_446_000_000_000_000_000",
  'b"wPWRC"',
  'b"Wrapped PowerChain"',
]) {
  if (!source.includes(invariant)) {
    failures.push(
      `wpwrc:${invariant}`,
    );
  }
}

const moveToml =
  fs.readFileSync(
    "contracts/wpwrc/Move.toml",
    "utf8",
  );

if (
  !moveToml.includes(
    'wpwrc = "0x0"',
  )
) {
  failures.push(
    "wpwrc:source-placeholder",
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

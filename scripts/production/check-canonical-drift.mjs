import fs from "node:fs";

const failures = [];

const token =
  JSON.parse(
    fs.readFileSync(
      "config/token.json",
      "utf8",
    ),
  );

const fees =
  JSON.parse(
    fs.readFileSync(
      "config/fees.json",
      "utf8",
    ),
  );

const bridge =
  JSON.parse(
    fs.readFileSync(
      "config/bridge.json",
      "utf8",
    ),
  );

const programs =
  JSON.parse(
    fs.readFileSync(
      "config/programs.json",
      "utf8",
    ),
  );

const networks =
  JSON.parse(
    fs.readFileSync(
      "config/networks.json",
      "utf8",
    ),
  );

const expected = {
  version:
    "1.0.0",
  mint:
    "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc",
  tokenProgram:
    "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
  decimals:
    9,
  supply:
    "18446000000000000000",
  feeBps:
    250,
  feeCap:
    "1000000",
  verifier:
    "PWRCpWCpQ8BRn3pzMnvaTzMK9Q2GsxuLx7QgJgduLSu",
  wpwrcGenesis:
    "0",
};

for (const [
  label,
  actual,
  wanted,
] of [
  [
    "token.version",
    token.version,
    expected.version,
  ],
  [
    "token.mint",
    token.mint,
    expected.mint,
  ],
  [
    "token.tokenProgram",
    token.tokenProgram,
    expected.tokenProgram,
  ],
  [
    "token.decimals",
    token.decimals,
    expected.decimals,
  ],
  [
    "token.genesisSupplyBaseUnits",
    token.genesisSupplyBaseUnits,
    expected.supply,
  ],
  [
    "token.transferFee.basisPoints",
    token.transferFee?.basisPoints,
    expected.feeBps,
  ],
  [
    "token.transferFee.maximumFeeTokens",
    token.transferFee?.maximumFeeTokens,
    expected.feeCap,
  ],
  [
    "fees.nativeToken2022Fee.basisPoints",
    fees.nativeToken2022Fee?.basisPoints,
    expected.feeBps,
  ],
  [
    "programs.pwrcToken.sourceProgramId",
    programs.pwrcToken?.sourceProgramId,
    expected.verifier,
  ],
  [
    "bridge.wrapped.decimals",
    bridge.wrapped?.decimals,
    expected.decimals,
  ],
  [
    "bridge.wrapped.genesisSupplyBaseUnits",
    bridge.wrapped?.genesisSupplyBaseUnits,
    expected.wpwrcGenesis,
  ],
  [
    "bridge.ratio.canonicalBaseUnitsPerWrappedBaseUnit",
    bridge.ratio?.canonicalBaseUnitsPerWrappedBaseUnit,
    "1",
  ],
  [
    "networks.solana.localnet.pwrcTokenProgramId",
    networks.solana?.localnet?.pwrcTokenProgramId,
    expected.verifier,
  ],
  [
    "networks.solana.devnet.pwrcTokenProgramId",
    networks.solana?.devnet?.pwrcTokenProgramId,
    expected.verifier,
  ],
]) {
  if (actual !== wanted) {
    failures.push(
      `${label}:expected=${wanted}:actual=${String(actual)}`,
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
      canonical:
        expected,
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}

import fs from "node:fs";
import {
  readJsonFileSync,
  requireKeys,
} from "../../packages/runtime/src/config.mjs";
import {
  PWRC_CANONICAL_MINT,
  PWRC_DECIMALS,
  PWRC_TRANSFER_FEE_BASIS_POINTS,
  PWRC_MAXIMUM_TRANSFER_FEE_TOKENS,
} from "../../packages/runtime/src/constants.mjs";

const failures = [];

const registry =
  readJsonFileSync(
    "config/registry.json",
  );

if (
  registry.version !==
    "1.0.0"
) {
  failures.push(
    "registry.version",
  );
}

for (
  const entry of
  registry.configs ?? []
) {
  if (
    typeof entry.id !==
      "string" ||
    typeof entry.path !==
      "string"
  ) {
    failures.push(
      "registry.entry.invalid",
    );
    continue;
  }

  let config;

  try {
    config =
      readJsonFileSync(
        entry.path,
      );
  } catch (error) {
    failures.push(
      `${entry.id}:read`,
    );
    continue;
  }

  try {
    requireKeys(
      config,
      entry.requiredKeys ??
        [],
      entry.id,
    );
  } catch {
    failures.push(
      `${entry.id}:required-keys`,
    );
  }
}

const token =
  readJsonFileSync(
    "config/token.json",
  );

if (
  token.mint !==
    PWRC_CANONICAL_MINT
) {
  failures.push(
    "token.canonicalMint",
  );
}

if (
  token.decimals !==
    PWRC_DECIMALS
) {
  failures.push(
    "token.decimals",
  );
}

if (
  token.transferFee
    ?.basisPoints !==
    PWRC_TRANSFER_FEE_BASIS_POINTS
) {
  failures.push(
    "token.transferFee.basisPoints",
  );
}

if (
  token.transferFee
    ?.maximumFeeTokens !==
    PWRC_MAXIMUM_TRANSFER_FEE_TOKENS
) {
  failures.push(
    "token.transferFee.maximumFeeTokens",
  );
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version: "1.0.0",
  registryEntries:
    registry.configs?.length ??
    0,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}

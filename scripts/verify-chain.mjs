import { execFileSync } from "node:child_process";

const mint = process.argv[2];
const expectedStatus = process.argv[3] ?? "genesis";
const rpcUrl = process.argv[4];
if (!mint) throw new Error("mint required");
if (!rpcUrl) throw new Error("rpcUrl required");

const sdkRaw = execFileSync(
  process.execPath,
  ["scripts/token/verify-mint-state.mjs", mint, rpcUrl, expectedStatus],
  { encoding: "utf8" },
);
const sdk = JSON.parse(sdkRaw);

const result = {
  version: "1.0.0",
  mint,
  expectedStatus,
  token2022: sdk,
  verified: sdk.verified === true,
  errors: sdk.errors ?? [],
};
console.log(JSON.stringify(result, null, 2));
if (!result.verified) process.exit(2);

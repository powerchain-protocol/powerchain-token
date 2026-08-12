import fs from "node:fs";

const failures = [];
const moveToml = fs.readFileSync("contracts/wpwrc/Move.toml", "utf8");

if (!/edition\s*=\s*"2024"/.test(moveToml)) failures.push("sui.Move.toml:edition-2024");
if (/^Sui\s*=/m.test(moveToml)) failures.push("sui.Move.toml:explicit-Sui-dependency");

const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const token = JSON.parse(fs.readFileSync("config/token.json", "utf8"));
const production = JSON.parse(
  fs.readFileSync("config/production/policy.json", "utf8"),
);
const mainnet = JSON.parse(
  fs.readFileSync("config/mainnet/bridge.json", "utf8"),
);

if (pkg.version !== "1.0.0") failures.push("package.version");
if (token.mint !== "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc") {
  failures.push("token.canonicalMint");
}
if (token.decimals !== 9) failures.push("token.decimals");
if (token.transferFee?.basisPoints !== 250) failures.push("token.transferFeeBasisPoints");
if (token.transferFee?.maximumFeeTokens !== "1000000") {
  failures.push("token.maximumTransferFeeTokens");
}
if (production.mainnetFailClosed !== true) failures.push("production.mainnetFailClosed");
if (mainnet.solana?.network !== "mainnet-beta") failures.push("mainnet.solana.network");
if (mainnet.sui?.network !== "mainnet") failures.push("mainnet.sui.network");
if (!fs.existsSync("pnpm-lock.yaml")) failures.push("pnpm-lock.yaml");

const result = {
  ok: failures.length === 0,
  version: "1.0.0",
  phase: "mainnet-prebuild",
  deploymentEvidenceRequiredAtThisPhase: false,
  failures,
};

fs.mkdirSync("reports", { recursive: true });
fs.writeFileSync(
  "reports/mainnet-prebuild.json",
  `${JSON.stringify(result, null, 2)}\n`,
);
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);

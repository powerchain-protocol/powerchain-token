import fs from "node:fs";

const failures = [];
const moveToml = fs.readFileSync("contracts/wpwrc/Move.toml", "utf8");

if (!/edition\s*=\s*"2024"/.test(moveToml)) failures.push("sui.Move.toml:edition-2024");
if (/^Sui\s*=/m.test(moveToml)) failures.push("sui.Move.toml:explicit-Sui-dependency");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const token = JSON.parse(fs.readFileSync("config/token.json", "utf8"));
const devnet = JSON.parse(fs.readFileSync("config/devnet/bridge.json", "utf8"));

if (pkg.version !== "1.0.0") failures.push("package.version");
if (token.decimals !== 9) failures.push("token.decimals");
if (token.transferFee?.basisPoints !== 250) failures.push("token.transferFeeBasisPoints");
if (devnet.solana?.network !== "devnet") failures.push("devnet.solana.network");
if (devnet.sui?.network !== "devnet") failures.push("devnet.sui.network");
if (devnet.policy?.deploymentEvidenceRequired !== true) {
  failures.push("devnet.deploymentEvidencePolicy");
}

const result = {
  ok: failures.length === 0,
  version: "1.0.0",
  phase: "devnet-prebuild",
  deploymentEvidenceRequiredAtThisPhase: false,
  failures,
};

fs.mkdirSync("reports", { recursive: true });
fs.writeFileSync(
  "reports/devnet-prebuild.json",
  `${JSON.stringify(result, null, 2)}\n`,
);
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exit(1);

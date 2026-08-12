import fs from "node:fs";
import crypto from "node:crypto";

const config = JSON.parse(
  fs.readFileSync("config/mainnet/bridge.json", "utf8"),
);

const blockers = [];

if (!fs.existsSync("pnpm-lock.yaml")) blockers.push("pnpm-lock.yaml");
if (!fs.existsSync("reports/release-provenance.json")) {
  blockers.push("releaseProvenance");
}

const moveTomlPath = "contracts/wpwrc/Move.toml";
const moveLockPath = "contracts/wpwrc/Move.lock";
const moveToml = fs.readFileSync(moveTomlPath, "utf8");

if (!/edition\s*=\s*"2024"/.test(moveToml)) {
  blockers.push("sui.Move.toml:edition-2024-required");
}
if (/\[dependencies\][\s\S]*?Sui\s*=/.test(moveToml)) {
  blockers.push("sui.Move.toml:explicit-framework-dependency-forbidden");
}
if (!fs.existsSync(moveLockPath)) {
  blockers.push("sui.Move.lock");
}

let actualMoveLockSha256 = null;
if (fs.existsSync(moveLockPath)) {
  actualMoveLockSha256 = crypto
    .createHash("sha256")
    .update(fs.readFileSync(moveLockPath))
    .digest("hex");
}

for (const [name, value] of Object.entries({
  "solana.rpcUrl": config.solana.rpcUrl,
  "solana.canonicalMint": config.solana.canonicalMint,
  "solana.bridgeProgramId": config.solana.bridgeProgramId,
  "solana.bridgeVault": config.solana.bridgeVault,
  "sui.packageId": config.sui.packageId,
  "sui.coinType": config.sui.coinType,
  "sui.currencyObjectId": config.sui.currencyObjectId,
  "sui.bridgeControllerId": config.sui.bridgeControllerId,
  "sui.moveLockSha256": config.sui.moveLockSha256,
  "sui.suiCliVersion": config.sui.suiCliVersion,
  "governance.operator": config.governance.operator,
  "governance.governor": config.governance.governor,
})) {
  if (!value) blockers.push(name);
}

if (
  config.sui.moveLockSha256 &&
  !/^[a-f0-9]{64}$/i.test(config.sui.moveLockSha256)
) {
  blockers.push("sui.moveLockSha256:invalid");
}
if (
  actualMoveLockSha256 &&
  config.sui.moveLockSha256 &&
  actualMoveLockSha256 !== config.sui.moveLockSha256
) {
  blockers.push("sui.moveLockSha256:mismatch");
}

for (const [name, value] of Object.entries({
  "solana.mintVerified": config.solana.mintVerified,
  "solana.programVerified": config.solana.programVerified,
  "solana.vaultVerified": config.solana.vaultVerified,
  "solana.mintAuthorityRevoked": config.solana.mintAuthorityRevoked,
  "solana.freezeAuthorityNull": config.solana.freezeAuthorityNull,
  "solana.transferFeeConfigVerified": config.solana.transferFeeConfigVerified,
  "solana.transferFeeConfigAuthorityVerified":
    config.solana.transferFeeConfigAuthorityVerified,
  "solana.withdrawWithheldAuthorityVerified":
    config.solana.withdrawWithheldAuthorityVerified,
  "solana.bridgeVerifierVerified": config.solana.bridgeVerifierVerified,
  "sui.packageVerified": config.sui.packageVerified,
  "sui.currencyVerified": config.sui.currencyVerified,
  "sui.controllerVerified": config.sui.controllerVerified,
  "sui.bridgeAuthorityVerified": config.sui.bridgeAuthorityVerified,
  "governance.operatorGovernorSeparated":
    config.governance.operatorGovernorSeparated,
})) {
  if (!value) blockers.push(name);
}

const idlReleaseFile = "idl/release/1.0.0.json";
if (!fs.existsSync(idlReleaseFile)) {
  blockers.push("idl.releaseManifest");
} else {
  const idlRelease = JSON.parse(fs.readFileSync(idlReleaseFile, "utf8"));
  if (idlRelease.status !== "release-idl-ready") {
    blockers.push("idl.releaseManifest:not-ready");
  }
}

const result = {
  ok: blockers.length === 0,
  version: "1.0.0",
  readyForMainnet: blockers.length === 0,
  movePackage: {
    edition: "2024",
    moveLockPresent: fs.existsSync(moveLockPath),
    actualMoveLockSha256,
  },
  blockers,
};

fs.mkdirSync("reports", { recursive: true });
fs.writeFileSync(
  "reports/mainnet-status.json",
  `${JSON.stringify(result, null, 2)}\n`,
);
console.log(JSON.stringify(result, null, 2));

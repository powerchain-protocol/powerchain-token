import fs from "node:fs";

const config = JSON.parse(
  fs.readFileSync(
    "config/mainnet/bridge.json",
    "utf8",
  ),
);

const blockers = [];

if (!fs.existsSync("pnpm-lock.yaml")) {
  blockers.push("pnpm-lock.yaml");
}
if (!fs.existsSync("reports/release-provenance.json")) {
  blockers.push("releaseProvenance");
}
const moveToml = fs.readFileSync(
  "contracts/wpwrc/Move.toml",
  "utf8",
);
if (/rev\s*=\s*"framework\//.test(moveToml)) {
  blockers.push("sui.Move.toml:not-pinned-to-immutable-commit");
}

for (const [name, value] of Object.entries({
  "solana.rpcUrl": config.solana.rpcUrl,
  "solana.canonicalMint":
    config.solana.canonicalMint,
  "solana.bridgeProgramId":
    config.solana.bridgeProgramId,
  "solana.bridgeVault":
    config.solana.bridgeVault,
  "sui.packageId": config.sui.packageId,
  "sui.coinType": config.sui.coinType,
  "sui.currencyObjectId":
    config.sui.currencyObjectId,
  "sui.bridgeControllerId":
    config.sui.bridgeControllerId,
  "sui.frameworkRevision":
    config.sui.frameworkRevision,
  "governance.operator":
    config.governance.operator,
  "governance.governor":
    config.governance.governor,
})) {
  if (!value) blockers.push(name);
}

for (const [name, value] of Object.entries({
  "solana.mintVerified":
    config.solana.mintVerified,
  "solana.programVerified":
    config.solana.programVerified,
  "solana.vaultVerified":
    config.solana.vaultVerified,
  "solana.mintAuthorityRevoked":
    config.solana.mintAuthorityRevoked,
  "solana.freezeAuthorityNull":
    config.solana.freezeAuthorityNull,
  "solana.transferFeeConfigVerified":
    config.solana.transferFeeConfigVerified,
  "solana.transferFeeConfigAuthorityVerified":
    config.solana.transferFeeConfigAuthorityVerified,
  "solana.withdrawWithheldAuthorityVerified":
    config.solana.withdrawWithheldAuthorityVerified,
  "solana.bridgeVerifierVerified":
    config.solana.bridgeVerifierVerified,
  "sui.packageVerified":
    config.sui.packageVerified,
  "sui.currencyVerified":
    config.sui.currencyVerified,
  "sui.controllerVerified":
    config.sui.controllerVerified,
  "sui.bridgeAuthorityVerified":
    config.sui.bridgeAuthorityVerified,
  "governance.operatorGovernorSeparated":
    config.governance.operatorGovernorSeparated,
})) {
  if (!value) blockers.push(name);
}

if (
  config.sui.frameworkRevision &&
  !/^[a-f0-9]{40}$/i.test(
    config.sui.frameworkRevision,
  )
) {
  blockers.push(
    "sui.frameworkRevision:not-immutable-commit",
  );
}


const idlReleaseFile =
  "idl/release/1.0.0.json";

if (!fs.existsSync(idlReleaseFile)) {
  blockers.push(
    "idl.releaseManifest",
  );
} else {
  const idlRelease = JSON.parse(
    fs.readFileSync(
      idlReleaseFile,
      "utf8",
    ),
  );

  if (
    idlRelease.status !==
    "release-idl-ready"
  ) {
    blockers.push(
      "idl.releaseManifest:not-ready",
    );
  }
}

const result = {
  ok: blockers.length === 0,
  version: "1.0.0",
  readyForMainnet: blockers.length === 0,
  blockers,
};

fs.mkdirSync("reports", {
  recursive: true,
});
fs.writeFileSync(
  "reports/mainnet-status.json",
  `${JSON.stringify(result, null, 2)}\n`,
);
console.log(JSON.stringify(result, null, 2));

import fs from "node:fs";

const failures = [];

for (const file of [
  "scripts/mainnet/lib.mjs",
  "scripts/mainnet/status.mjs",
  "scripts/mainnet/preflight.mjs",
  "scripts/mainnet/verify-evidence.mjs",
  "scripts/mainnet/prepare-evidence.mjs",
  "scripts/mainnet/verify-build-manifest.mjs",
  "scripts/mainnet/generate-build-manifest.mjs",
  "config/mainnet/evidence.example.json",
  "scripts/mainnet/signature.mjs",
  "scripts/mainnet/prepare-release-authorization.mjs",
  "scripts/mainnet/verify-release-authorization.mjs",
  "config/mainnet/release-authorization.example.json",
  "scripts/mainnet/verify-evidence-bindings.mjs",
  "scripts/mainnet/check-release-authorization-unused.mjs",
  "scripts/mainnet/consume-release-authorization.mjs",
  "scripts/mainnet/export-signing-payload.mjs",
  "scripts/mainnet/release-state.mjs",
  "scripts/mainnet/write-preflight-proof.mjs",
  "docs/MAINNET.md",
]) {
  if (!fs.existsSync(file)) {
    failures.push(
      `missing:${file}`,
    );
  }
}

const verifier =
  fs.readFileSync(
    "scripts/mainnet/verify-evidence.mjs",
    "utf8",
  );

for (const invariant of [
  "assertSolanaPublicKey",
  "assertSuiObjectId",
  "assertSha256",
  "cryptographic-signature-required",
  "crypto.verify",
  "signer-key-must-be-ed25519",
  "roles-must-be-distinct",
  "independent-rpc-hosts-required",
  "observations:solana:slot-drift",
]) {
  if (!verifier.includes(invariant)) {
    failures.push(
      `evidence-verifier:${invariant}`,
    );
  }
}

const status =
  fs.readFileSync(
    "scripts/mainnet/status.mjs",
    "utf8",
  );

for (const phase of [
  "codeReady",
  "buildReady",
  "deploymentEvidenceReady",
  "readyForMainnet",
  "releaseAuthorized",
  "mainnet.build-manifest-verification",
  "authorizationUnusedReport",
  "authorizationConsumed",
  "releaseState",
  "evidenceBindingsReport",
]) {
  if (!status.includes(phase)) {
    failures.push(
      `mainnet-status:${phase}`,
    );
  }
}

console.log(
  JSON.stringify({
    ok:
      failures.length === 0,
    version: "1.0.0",
    mainnetReadyByDesign: true,
    failClosed: true,
    failures,
  }, null, 2),
);

if (failures.length) {
  process.exit(1);
}

import fs from "node:fs";
import crypto from "node:crypto";
import {
  atomicWriteJsonSync,
} from "../lib/atomic-json.mjs";

const source =
  "config/mainnet/evidence.example.json";

const destination =
  process.argv[2] ??
  "config/mainnet/evidence.json";

if (!fs.existsSync(source)) {
  throw new Error(
    "PWRC_MAINNET_EVIDENCE_TEMPLATE_MISSING",
  );
}

if (fs.existsSync(destination)) {
  throw new Error(
    `PWRC_MAINNET_EVIDENCE_EXISTS:${destination}`,
  );
}

const template =
  JSON.parse(
    fs.readFileSync(
      source,
      "utf8",
    ),
  );

if (
  fs.existsSync(
    "reports/release-provenance.json",
  )
) {
  const provenance =
    JSON.parse(
      fs.readFileSync(
        "reports/release-provenance.json",
        "utf8",
      ),
    );

  template.release.sourceTreeSha256 =
    provenance.sourceTreeSha256;
  template.release.provenancePayloadSha256 =
    provenance.payloadSha256;
}

if (
  fs.existsSync(
    "reports/mainnet-build-manifest.json",
  )
) {
  template.release.buildManifestSha256 =
    crypto
      .createHash("sha256")
      .update(
        fs.readFileSync(
          "reports/mainnet-build-manifest.json",
        ),
      )
      .digest("hex");
}

if (
  fs.existsSync(
    "idl/abi.fingerprint.json",
  )
) {
  const abi =
    JSON.parse(
      fs.readFileSync(
        "idl/abi.fingerprint.json",
        "utf8",
      ),
    );

  template.release.abiCombinedSha256 =
    abi.combinedAbiSha256;
}

for (const [
  key,
  file,
] of [
  [
    "generatedPwrcLockIdlSha256",
    "idl/generated/pwrc_lock.json",
  ],
  [
    "generatedPwrcTokenIdlSha256",
    "idl/generated/pwrc_token.json",
  ],
  [
    "suiNormalizedModulesSha256",
    "idl/generated/wpwrc.modules.json",
  ],
  [
    "pnpmLockSha256",
    "pnpm-lock.yaml",
  ],
]) {
  if (fs.existsSync(file)) {
    template.release[key] =
      crypto
        .createHash("sha256")
        .update(
          fs.readFileSync(file),
        )
        .digest("hex");
  }
}

atomicWriteJsonSync(
  destination,
  template,
);

console.log(
  JSON.stringify({
    ok: true,
    version: "1.0.0",
    evidenceFile:
      destination,
    note:
      "Populate only from verified on-chain/build evidence. Never add private keys.",
  }, null, 2),
);

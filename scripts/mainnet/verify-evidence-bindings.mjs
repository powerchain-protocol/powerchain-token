import fs from "node:fs";
import crypto from "node:crypto";
import {
  canonicalJsonSha256,
} from "./lib.mjs";
import {
  atomicWriteJsonSync,
} from "../lib/atomic-json.mjs";

const evidenceFile =
  process.argv[2] ??
  "config/mainnet/evidence.json";

const failures = [];

if (!fs.existsSync(evidenceFile)) {
  failures.push(
    `evidence-bindings:missing:${evidenceFile}`,
  );
}

let evidence = null;

if (!failures.length) {
  try {
    evidence =
      JSON.parse(
        fs.readFileSync(
          evidenceFile,
          "utf8",
        ),
      );
  } catch {
    failures.push(
      "evidence-bindings:invalid-json",
    );
  }
}

function rawSha256(file) {
  return crypto
    .createHash("sha256")
    .update(
      fs.readFileSync(file),
    )
    .digest("hex");
}

function requireFile(file, label) {
  if (!fs.existsSync(file)) {
    failures.push(
      `${label}:missing:${file}`,
    );
    return false;
  }

  return true;
}

function compare(
  label,
  expected,
  actual,
) {
  if (
    typeof expected !==
      "string" ||
    expected.toLowerCase() !==
      actual.toLowerCase()
  ) {
    failures.push(
      `${label}:mismatch`,
    );
  }
}

if (evidence) {
  if (
    requireFile(
      "reports/release-provenance.json",
      "release.provenance",
    )
  ) {
    const provenance =
      JSON.parse(
        fs.readFileSync(
          "reports/release-provenance.json",
          "utf8",
        ),
      );

    compare(
      "release.sourceTreeSha256",
      evidence.release
        ?.sourceTreeSha256,
      provenance.sourceTreeSha256,
    );

    compare(
      "release.provenancePayloadSha256",
      evidence.release
        ?.provenancePayloadSha256,
      provenance.payloadSha256,
    );
  }

  if (
    requireFile(
      "idl/abi.fingerprint.json",
      "release.abi",
    )
  ) {
    const abi =
      JSON.parse(
        fs.readFileSync(
          "idl/abi.fingerprint.json",
          "utf8",
        ),
      );

    compare(
      "release.abiCombinedSha256",
      evidence.release
        ?.abiCombinedSha256,
      abi.combinedAbiSha256,
    );
  }

  for (const [
    label,
    evidenceKey,
    file,
  ] of [
    [
      "release.generatedPwrcLockIdlSha256",
      "generatedPwrcLockIdlSha256",
      "idl/generated/pwrc_lock.json",
    ],
    [
      "release.generatedPwrcTokenIdlSha256",
      "generatedPwrcTokenIdlSha256",
      "idl/generated/pwrc_token.json",
    ],
    [
      "release.suiNormalizedModulesSha256",
      "suiNormalizedModulesSha256",
      "idl/generated/wpwrc.modules.json",
    ],
    [
      "release.pnpmLockSha256",
      "pnpmLockSha256",
      "pnpm-lock.yaml",
    ],
  ]) {
    if (
      requireFile(
        file,
        label,
      )
    ) {
      compare(
        label,
        evidence.release?.[
          evidenceKey
        ],
        rawSha256(file),
      );
    }
  }

  if (
    requireFile(
      "reports/mainnet-build-manifest.json",
      "release.buildManifest",
    )
  ) {
    const buildManifest =
      JSON.parse(
        fs.readFileSync(
          "reports/mainnet-build-manifest.json",
          "utf8",
        ),
      );

    compare(
      "release.buildManifestSha256",
      evidence.release
        ?.buildManifestSha256,
      canonicalJsonSha256(
        buildManifest,
      ),
    );
  }

  if (
    requireFile(
      "contracts/wpwrc/Move.lock",
      "sui.moveLock",
    )
  ) {
    compare(
      "sui.moveLockSha256",
      evidence.sui
        ?.moveLockSha256,
      rawSha256(
        "contracts/wpwrc/Move.lock",
      ),
    );
  }

  if (
    fs.existsSync(
      "config/mainnet/bridge.json",
    )
  ) {
    const config =
      JSON.parse(
        fs.readFileSync(
          "config/mainnet/bridge.json",
          "utf8",
        ),
      );

    if (
      config.solana
        ?.bridgeProgramId &&
      config.solana
        .bridgeProgramId !==
        evidence.solana
          ?.bridgeProgramId
    ) {
      failures.push(
        "config.solana.bridgeProgramId:mismatch",
      );
    }

    if (
      config.solana
        ?.bridgeVault &&
      config.solana
        .bridgeVault !==
        evidence.solana
          ?.bridgeVault
    ) {
      failures.push(
        "config.solana.bridgeVault:mismatch",
      );
    }

    if (
      config.sui?.packageId &&
      config.sui.packageId !==
        evidence.sui
          ?.packageId
    ) {
      failures.push(
        "config.sui.packageId:mismatch",
      );
    }

    if (
      config.sui
        ?.bridgeControllerId &&
      config.sui
        .bridgeControllerId !==
        evidence.sui
          ?.bridgeControllerId
    ) {
      failures.push(
        "config.sui.bridgeControllerId:mismatch",
      );
    }
  }
}

const result = {
  ok:
    failures.length === 0,
  version: "1.0.0",
  evidenceFile,
  failures,
};

atomicWriteJsonSync(
  "reports/mainnet-evidence-bindings-verification.json",
  result,
);

console.log(
  JSON.stringify(
    result,
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(2);
}

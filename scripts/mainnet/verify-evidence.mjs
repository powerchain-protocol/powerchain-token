import fs from "node:fs";
import crypto from "node:crypto";

const file =
  "config/mainnet/evidence.json";
const failures = [];

function sha256File(path) {
  return crypto
    .createHash("sha256")
    .update(
      fs.readFileSync(path),
    )
    .digest("hex");
}

function requireSha(
  value,
  label,
) {
  if (
    !/^[a-f0-9]{64}$/i.test(
      value ?? "",
    )
  ) {
    failures.push(
      `evidence:${label}:sha256`,
    );
    return null;
  }

  return value.toLowerCase();
}

function compareFileHash(
  expected,
  path,
  label,
) {
  if (!fs.existsSync(path)) {
    failures.push(
      `evidence:${label}:missing-file:${path}`,
    );
    return;
  }

  const actual =
    sha256File(path);

  if (
    expected?.toLowerCase() !==
      actual
  ) {
    failures.push(
      `evidence:${label}:hash-mismatch`,
    );
  }
}

if (!fs.existsSync(file)) {
  failures.push(
    `missing:${file}`,
  );
} else {
  let evidence;

  try {
    evidence =
      JSON.parse(
        fs.readFileSync(
          file,
          "utf8",
        ),
      );
  } catch {
    failures.push(
      "evidence:invalid-json",
    );
  }

  if (evidence) {
    if (
      evidence.version !==
        "1.0.0"
    ) {
      failures.push(
        "evidence:version",
      );
    }

    if (
      evidence.solana
        ?.canonicalMint !==
        "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc" ||
      evidence.solana
        ?.canonicalMintVerified !==
        true
    ) {
      failures.push(
        "evidence:canonical-mint",
      );
    }

    for (const [
      label,
      program,
      binary,
    ] of [
      [
        "pwrcLock",
        evidence.solana
          ?.pwrcLockProgram,
        "target/deploy/pwrc_lock.so",
      ],
      [
        "pwrcToken",
        evidence.solana
          ?.pwrcTokenProgram,
        "target/deploy/pwrc_token.so",
      ],
    ]) {
      if (!program) {
        failures.push(
          `evidence:${label}`,
        );
        continue;
      }

      if (!program.programId) {
        failures.push(
          `evidence:${label}:programId`,
        );
      }

      const binaryHash =
        requireSha(
          program.binarySha256,
          `${label}:binary`,
        );

      if (binaryHash) {
        compareFileHash(
          binaryHash,
          binary,
          `${label}:binary`,
        );
      }

      if (
        !program.deploymentTransaction
      ) {
        failures.push(
          `evidence:${label}:deploymentTransaction`,
        );
      }

      if (
        !Number.isSafeInteger(
          program.deploymentSlot,
        ) ||
        program.deploymentSlot <= 0
      ) {
        failures.push(
          `evidence:${label}:deploymentSlot`,
        );
      }

      for (const field of [
        "executable",
        "primaryRpcVerified",
        "secondaryRpcVerified",
      ]) {
        if (
          program[field] !==
            true
        ) {
          failures.push(
            `evidence:${label}:${field}`,
          );
        }
      }
    }

    if (
      evidence.solana
        ?.pwrcTokenProgram
        ?.programId !==
        "PWRCpWCpQ8BRn3pzMnvaTzMK9Q2GsxuLx7QgJgduLSu"
    ) {
      failures.push(
        "evidence:pwrc-token-program-id",
      );
    }

    if (
      evidence.solana
        ?.pwrcTokenProgram
        ?.anchorVerified !==
        true
    ) {
      failures.push(
        "evidence:pwrc-token-anchor-verify",
      );
    }

    for (const field of [
      "packageId",
      "coinType",
      "bridgeControllerId",
      "publishTransaction",
    ]) {
      if (
        !evidence.sui?.[
          field
        ]
      ) {
        failures.push(
          `evidence:sui:${field}`,
        );
      }
    }

    if (
      !Number.isSafeInteger(
        evidence.sui
          ?.checkpoint,
      ) ||
      evidence.sui
        .checkpoint <= 0
    ) {
      failures.push(
        "evidence:sui:checkpoint",
      );
    }

    for (const field of [
      "primaryRpcVerified",
      "secondaryRpcVerified",
      "zeroGenesisSupplyVerified",
      "nineDecimalsVerified",
    ]) {
      if (
        evidence.sui?.[
          field
        ] !== true
      ) {
        failures.push(
          `evidence:sui:${field}`,
        );
      }
    }

    const release =
      evidence.release ??
      {};

    const sourceTreeSha256 =
      requireSha(
        release.sourceTreeSha256,
        "release:sourceTree",
      );
    const pnpmLockSha256 =
      requireSha(
        release.pnpmLockSha256,
        "release:pnpmLock",
      );
    const cargoLockSha256 =
      requireSha(
        release.cargoLockSha256,
        "release:cargoLock",
      );
    const moveLockSha256 =
      requireSha(
        release.moveLockSha256,
        "release:moveLock",
      );
    const buildManifestSha256 =
      requireSha(
        release.buildManifestSha256,
        "release:buildManifest",
      );

    if (pnpmLockSha256) {
      compareFileHash(
        pnpmLockSha256,
        "pnpm-lock.yaml",
        "release:pnpmLock",
      );
    }

    if (cargoLockSha256) {
      compareFileHash(
        cargoLockSha256,
        "Cargo.lock",
        "release:cargoLock",
      );
    }

    if (moveLockSha256) {
      compareFileHash(
        moveLockSha256,
        "contracts/wpwrc/Move.lock",
        "release:moveLock",
      );
    }

    if (buildManifestSha256) {
      compareFileHash(
        buildManifestSha256,
        "reports/mainnet-build-manifest.json",
        "release:buildManifest",
      );
    }

    if (
      sourceTreeSha256 &&
      fs.existsSync(
        "reports/source-tree.sha256",
      )
    ) {
      const recorded =
        fs.readFileSync(
          "reports/source-tree.sha256",
          "utf8",
        )
        .trim()
        .toLowerCase();

      if (
        recorded !==
          sourceTreeSha256
      ) {
        failures.push(
          "evidence:release:sourceTree:hash-mismatch",
        );
      }
    }
  }
}

const result = {
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  filesBound:
    [
      "pnpm-lock.yaml",
      "Cargo.lock",
      "contracts/wpwrc/Move.lock",
      "target/deploy/pwrc_lock.so",
      "target/deploy/pwrc_token.so",
      "reports/mainnet-build-manifest.json",
    ],
  failures,
};

fs.mkdirSync(
  "reports",
  { recursive: true },
);

fs.writeFileSync(
  "reports/mainnet-evidence-verification.json",
  `${JSON.stringify(result, null, 2)}\n`,
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

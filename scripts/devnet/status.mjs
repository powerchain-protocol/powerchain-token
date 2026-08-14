import fs from "node:fs";
import {
  spawnSync,
} from "node:child_process";

const required = [
  "target/deploy/pwrc_lock.so",
  "target/deploy/pwrc_token.so",
];

const missing =
  required.filter(
    (file) =>
      !fs.existsSync(file),
  );

let evidenceVerified =
  false;

if (
  fs.existsSync(
    "deployments/devnet/solana/evidence.json",
  ) ||
  fs.existsSync(
    "deployments/devnet/sui/evidence.json",
  ) ||
  fs.existsSync(
    "deployments/devnet/sui/verification.json",
  )
) {
  const verification =
    spawnSync(
      process.execPath,
      [
        "scripts/devnet/verify-evidence.mjs",
      ],
      {
        encoding:
          "utf8",
      },
    );

  evidenceVerified =
    verification.status === 0;
}

const result = {
  ok:
    true,
  version:
    "1.0.0",
  buildArtifactsReady:
    missing.length === 0,
  deploymentEvidenceVerified:
    evidenceVerified,
  qualified:
    missing.length === 0 &&
    evidenceVerified,
  blockers: [
    ...missing,
    ...(!evidenceVerified
      ? [
          "devnet-deployment-evidence:not-verified",
        ]
      : []),
  ],
};

fs.mkdirSync(
  "reports",
  {
    recursive:
      true,
  },
);

fs.writeFileSync(
  "reports/devnet-status.json",
  `${JSON.stringify(result, null, 2)}\n`,
);

console.log(
  JSON.stringify(
    result,
    null,
    2,
  ),
);

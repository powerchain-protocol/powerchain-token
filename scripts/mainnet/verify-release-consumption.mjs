import fs from "node:fs";
import crypto from "node:crypto";

const file =
  "config/mainnet/release-consumption.json";
const failures = [];

function sha256(path) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(path))
    .digest("hex");
}

function requireFile(
  path,
  label,
) {
  if (!fs.existsSync(path)) {
    failures.push(
      `${label}:missing:${path}`,
    );
    return false;
  }
  return true;
}

const authFile =
  "config/mainnet/release-authorization.json";
const evidenceFile =
  "config/mainnet/evidence.json";
const buildFile =
  "reports/mainnet-build-manifest.json";

if (!fs.existsSync(file)) {
  failures.push(`missing:${file}`);
} else {
  let consumption;

  try {
    consumption =
      JSON.parse(
        fs.readFileSync(
          file,
          "utf8",
        ),
      );
  } catch {
    failures.push(
      "consumption:invalid-json",
    );
  }

  if (consumption) {
    if (
      consumption.version !==
        "1.0.0" ||
      consumption.release !==
        "powerchain-token-1.0.0" ||
      consumption.confirmation !==
        "PWRC-1.0.0-CONSUME-AUTHORIZATION"
    ) {
      failures.push(
        "consumption:identity",
      );
    }

    for (const [
      field,
      path,
      label,
    ] of [
      [
        "authorizationSha256",
        authFile,
        "authorization",
      ],
      [
        "evidenceSha256",
        evidenceFile,
        "evidence",
      ],
      [
        "buildManifestSha256",
        buildFile,
        "build-manifest",
      ],
    ]) {
      if (!requireFile(path, label)) {
        continue;
      }

      const expected =
        consumption[field] ??
        "";

      if (
        !/^[a-f0-9]{64}$/i.test(
          expected,
        )
      ) {
        failures.push(
          `consumption:${field}:invalid`,
        );
        continue;
      }

      if (
        sha256(path) !==
        expected.toLowerCase()
      ) {
        failures.push(
          `consumption:${field}:mismatch`,
        );
      }
    }

    const consumedAt =
      Date.parse(
        consumption.consumedAt ??
        "",
      );

    if (
      !Number.isFinite(
        consumedAt,
      ) ||
      consumedAt >
        Date.now() +
        60_000
    ) {
      failures.push(
        "consumption:consumedAt",
      );
    }

    if (
      typeof consumption.consumedBy !==
        "string" ||
      !consumption.consumedBy.trim()
    ) {
      failures.push(
        "consumption:consumedBy",
      );
    }
  }
}

const result = {
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  failures,
};

fs.mkdirSync(
  "reports",
  {
    recursive:
      true,
  },
);

fs.writeFileSync(
  "reports/release-consumption-verification.json",
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

import fs from "node:fs";
import crypto from "node:crypto";

const file =
  "reports/mainnet-build-manifest.json";
const failures = [];

function sha256(path) {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(path))
    .digest("hex");
}

if (!fs.existsSync(file)) {
  failures.push(`missing:${file}`);
} else {
  let manifest;

  try {
    manifest =
      JSON.parse(
        fs.readFileSync(
          file,
          "utf8",
        ),
      );
  } catch {
    failures.push(
      "build-manifest:invalid-json",
    );
  }

  if (manifest) {
    if (
      manifest.version !==
        "1.0.0" ||
      manifest.type !==
        "powerchain-mainnet-build-manifest"
    ) {
      failures.push(
        "build-manifest:identity",
      );
    }

    for (
      const [
        path,
        expected,
      ] of
      Object.entries(
        manifest.source ??
        {},
      )
    ) {
      if (!fs.existsSync(path)) {
        failures.push(
          `build-manifest:source:missing:${path}`,
        );
        continue;
      }

      const actual =
        sha256(path);

      if (
        actual !==
        String(expected)
          .toLowerCase()
      ) {
        failures.push(
          `build-manifest:source:hash-mismatch:${path}`,
        );
      }
    }

    for (
      const [
        path,
        metadata,
      ] of
      Object.entries(
        manifest.artifacts ??
        {},
      )
    ) {
      if (!fs.existsSync(path)) {
        failures.push(
          `build-manifest:artifact:missing:${path}`,
        );
        continue;
      }

      const actualHash =
        sha256(path);
      const actualBytes =
        fs.statSync(path)
          .size;

      if (
        actualHash !==
        metadata?.sha256
          ?.toLowerCase()
      ) {
        failures.push(
          `build-manifest:artifact:hash-mismatch:${path}`,
        );
      }

      if (
        actualBytes !==
        metadata?.bytes
      ) {
        failures.push(
          `build-manifest:artifact:size-mismatch:${path}`,
        );
      }
    }

    for (const required of [
      "pnpm-lock.yaml",
      "Cargo.lock",
      "contracts/wpwrc/Move.lock",
      "config/token.json",
      "config/fees.json",
      "config/programs.json",
      "config/networks.json",
      "config/cdp-sql.json",
      "config/api.json",
      "swagger/openapi.json",
      "swagger/openapi.yaml",
    ]) {
      if (
        !Object.prototype.hasOwnProperty.call(
          manifest.source ??
          {},
          required,
        )
      ) {
        failures.push(
          `build-manifest:required-source:${required}`,
        );
      }
    }

    for (const required of [
      "target/deploy/pwrc_lock.so",
      "target/deploy/pwrc_token.so",
    ]) {
      if (
        !Object.prototype.hasOwnProperty.call(
          manifest.artifacts ??
          {},
          required,
        )
      ) {
        failures.push(
          `build-manifest:required-artifact:${required}`,
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
  manifest:
    file,
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
  "reports/mainnet-build-manifest-verification.json",
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

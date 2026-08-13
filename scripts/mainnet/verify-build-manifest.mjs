import fs from "node:fs";
import crypto from "node:crypto";
import {
  atomicWriteJsonSync,
} from "../lib/atomic-json.mjs";

const file =
  "reports/mainnet-build-manifest.json";

const failures = [];

if (!fs.existsSync(file)) {
  failures.push(
    "build-manifest:missing",
  );
}

let manifest = null;

if (!failures.length) {
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
}

function sha256(filePath) {
  return crypto
    .createHash("sha256")
    .update(
      fs.readFileSync(filePath),
    )
    .digest("hex");
}

if (manifest) {
  if (
    manifest.version !== "1.0.0" ||
    manifest.type !==
      "powerchain-mainnet-build-manifest"
  ) {
    failures.push(
      "build-manifest:identity",
    );
  }

  const {
    payloadSha256,
    ...payload
  } = manifest;

  const actualPayloadSha256 =
    crypto
      .createHash("sha256")
      .update(
        JSON.stringify(payload),
      )
      .digest("hex");

  if (
    payloadSha256 !==
      actualPayloadSha256
  ) {
    failures.push(
      "build-manifest:payload-hash",
    );
  }

  for (
    const [name, entry]
    of Object.entries(
      manifest.files ?? {},
    )
  ) {
    if (
      !entry?.path ||
      !fs.existsSync(
        entry.path,
      )
    ) {
      failures.push(
        `build-manifest:${name}:missing`,
      );
      continue;
    }

    const actual =
      sha256(entry.path);

    if (
      actual !==
      entry.sha256
    ) {
      failures.push(
        `build-manifest:${name}:hash-mismatch`,
      );
    }

    if (
      fs.statSync(
        entry.path,
      ).size !==
      entry.bytes
    ) {
      failures.push(
        `build-manifest:${name}:size-mismatch`,
      );
    }
  }


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

    const packageEntry =
      manifest.files
        ?.pnpmLock;

    if (
      provenance.version !==
      "1.0.0"
    ) {
      failures.push(
        "build-manifest:provenance-version",
      );
    }

    if (
      packageEntry &&
      !/^[a-f0-9]{64}$/i.test(
        provenance
          .sourceTreeSha256 ??
        "",
      )
    ) {
      failures.push(
        "build-manifest:provenance-source-hash",
      );
    }
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

    const abiEntry =
      manifest.files
        ?.abiFingerprint;

    if (
      abiEntry &&
      abiEntry.sha256 !==
        sha256(
          abiEntry.path,
        )
    ) {
      failures.push(
        "build-manifest:abi-fingerprint-hash",
      );
    }

    if (
      typeof abi
        .combinedAbiSha256 !==
        "string" ||
      !/^[a-f0-9]{64}$/i.test(
        abi.combinedAbiSha256,
      )
    ) {
      failures.push(
        "build-manifest:abi-combined-hash-invalid",
      );
    }
  }

  if (
    fs.existsSync(
      "idl/release/1.0.0.json",
    )
  ) {
    const release =
      JSON.parse(
        fs.readFileSync(
          "idl/release/1.0.0.json",
          "utf8",
        ),
      );

    if (
      release.version !==
        "1.0.0" ||
      release.status !==
        "release-idl-ready"
    ) {
      failures.push(
        "build-manifest:idl-release-identity",
      );
    }
  }

  const idlRelease =
    manifest.files
      ?.idlReleaseManifest
      ?.path;

  if (idlRelease) {
    const release =
      JSON.parse(
        fs.readFileSync(
          idlRelease,
          "utf8",
        ),
      );

    if (
      release.status !==
      "release-idl-ready"
    ) {
      failures.push(
        "build-manifest:idl-release-not-ready",
      );
    }
  }
}

const result = {
  ok:
    failures.length === 0,
  version: "1.0.0",
  failures,
};

atomicWriteJsonSync(
  "reports/mainnet-build-manifest-verification.json",
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

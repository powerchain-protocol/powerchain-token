import fs from "node:fs";
import path from "node:path";
import {
  atomicWriteJsonSync,
} from "../lib/atomic-json.mjs";

const authorizationFile =
  process.argv[2] ??
  "config/mainnet/release-authorization.json";

const failures = [];
let nonce = null;

if (!fs.existsSync(authorizationFile)) {
  failures.push(
    `authorization-unused:missing:${authorizationFile}`,
  );
} else {
  try {
    const authorization =
      JSON.parse(
        fs.readFileSync(
          authorizationFile,
          "utf8",
        ),
      );

    nonce =
      authorization.nonce;

    if (
      typeof nonce !==
        "string" ||
      !/^[a-f0-9]{64}$/i.test(
        nonce,
      )
    ) {
      failures.push(
        "authorization-unused:nonce-invalid",
      );
    }
  } catch {
    failures.push(
      "authorization-unused:invalid-json",
    );
  }
}

const ledgerDirectory =
  "deployments/mainnet/authorizations";

const consumedFile =
  nonce
    ? path.join(
        ledgerDirectory,
        `${nonce.toLowerCase()}.json`,
      )
    : null;

if (
  consumedFile &&
  fs.existsSync(consumedFile)
) {
  failures.push(
    "authorization-unused:already-consumed",
  );
}

const result = {
  ok:
    failures.length === 0,
  version: "1.0.0",
  nonce,
  consumedFile,
  failures,
};

atomicWriteJsonSync(
  "reports/mainnet-release-authorization-unused.json",
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

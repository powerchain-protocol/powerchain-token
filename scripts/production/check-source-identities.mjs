import fs from "node:fs";

const failures = [];

const tokenSource =
  fs.readFileSync(
    "programs/token/src/lib.rs",
    "utf8",
  );

const lockSource =
  fs.readFileSync(
    "programs/pwrc-lock/src/lib.rs",
    "utf8",
  );

const anchor =
  fs.readFileSync(
    "Anchor.toml",
    "utf8",
  );

const constants =
  fs.readFileSync(
    "packages/protocol/src/constants.ts",
    "utf8",
  );

const verifier =
  "PWRCpWCpQ8BRn3pzMnvaTzMK9Q2GsxuLx7QgJgduLSu";
const localLock =
  "7JAV3PsxkHh5oKAFDMKqVpKaV2P2P5Vj3Qv15hH8wPwr";
const mint =
  "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc";

for (const [
  label,
  source,
  value,
] of [
  [
    "token-source-verifier",
    tokenSource,
    verifier,
  ],
  [
    "token-source-mint",
    tokenSource,
    mint,
  ],
  [
    "lock-source-local-id",
    lockSource,
    localLock,
  ],
  [
    "anchor-verifier",
    anchor,
    verifier,
  ],
  [
    "anchor-lock",
    anchor,
    localLock,
  ],
  [
    "constants-verifier",
    constants,
    verifier,
  ],
  [
    "constants-mint",
    constants,
    mint,
  ],
]) {
  if (!source.includes(value)) {
    failures.push(
      label,
    );
  }
}

console.log(
  JSON.stringify(
    {
      ok:
        failures.length === 0,
      version:
        "1.0.0",
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}

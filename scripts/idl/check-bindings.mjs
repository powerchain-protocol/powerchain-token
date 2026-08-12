import fs from "node:fs";

const failures = [];

const manifest = JSON.parse(
  fs.readFileSync(
    "idl/bindings/manifest.json",
    "utf8",
  ),
);
const lock = JSON.parse(
  fs.readFileSync(
    "idl/anchor/pwrc_lock.expected.json",
    "utf8",
  ),
);
const token = JSON.parse(
  fs.readFileSync(
    "idl/anchor/pwrc_token.expected.json",
    "utf8",
  ),
);
const sui = JSON.parse(
  fs.readFileSync(
    "idl/sui/wpwrc.interface.json",
    "utf8",
  ),
);
const fingerprint = JSON.parse(
  fs.readFileSync(
    "idl/abi.fingerprint.json",
    "utf8",
  ),
);

if (
  manifest.version !== "1.0.0"
) {
  failures.push("binding:version");
}

if (
  manifest.abiFingerprint !==
  fingerprint.combinedAbiSha256
) {
  failures.push(
    "binding:fingerprint",
  );
}

if (
  JSON.stringify(
    manifest.anchor.instructions,
  ) !==
  JSON.stringify(
    lock.instructions.map(
      (item) => item.name,
    ),
  )
) {
  failures.push(
    "binding:pwrc-lock-instructions",
  );
}

if (
  JSON.stringify(
    manifest.anchorTokenVerifier
      ?.instructions,
  ) !==
  JSON.stringify(
    token.instructions.map(
      (item) => item.name,
    ),
  )
) {
  failures.push(
    "binding:pwrc-token-instructions",
  );
}

if (
  JSON.stringify(
    manifest.sui.entryFunctions,
  ) !==
  JSON.stringify(
    sui.modules.bridge.entryFunctions,
  )
) {
  failures.push(
    "binding:sui-entry-functions",
  );
}

if (
  manifest.anchor
    .generatedIdlRequiredForEncoding !==
    true ||
  manifest.anchorTokenVerifier
    ?.generatedIdlRequiredForEncoding !==
    true
) {
  failures.push(
    "binding:generated-idl-policy",
  );
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  abiFingerprint:
    manifest.abiFingerprint,
  failures,
}, null, 2));

if (failures.length) process.exit(1);

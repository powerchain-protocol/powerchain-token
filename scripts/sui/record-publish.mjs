import fs from "node:fs";
import crypto from "node:crypto";
import path from "node:path";

const [
  network,
  input,
  output,
] =
  process.argv.slice(2);

if (
  !network ||
  !input ||
  !output
) {
  throw new Error(
    "PWRC_SUI_RECORD_PUBLISH_USAGE",
  );
}

if (
  ![
    "devnet",
    "mainnet",
  ].includes(network)
) {
  throw new Error(
    "PWRC_SUI_RECORD_NETWORK_INVALID",
  );
}

if (!fs.existsSync(input)) {
  throw new Error(
    `PWRC_SUI_PUBLISH_JSON_MISSING:${input}`,
  );
}

const raw =
  fs.readFileSync(input);
const parsed =
  JSON.parse(
    raw.toString("utf8"),
  );

const digest =
  parsed.digest ??
  parsed.effects
    ?.transactionDigest ??
  null;

const objectChanges =
  Array.isArray(
    parsed.objectChanges,
  )
    ? parsed.objectChanges
    : [];

const published =
  objectChanges.find(
    (change) =>
      change.type ===
        "published",
  );

const packageId =
  published?.packageId ??
  null;

const created =
  objectChanges.filter(
    (change) =>
      change.type ===
        "created",
  );

const bridgeController =
  created.find(
    (change) =>
      typeof change.objectType ===
        "string" &&
      change.objectType.endsWith(
        "::wpwrc::BridgeController",
      ),
  );

const metadataObject =
  created.find(
    (change) =>
      typeof change.objectType ===
        "string" &&
      (
        change.objectType.includes(
          "CoinMetadata<",
        ) ||
        change.objectType.includes(
          "TreasuryCap<",
        )
      ),
  );

const coinType =
  packageId
    ? `${packageId}::wpwrc::WPWRC`
    : null;

const record = {
  version:
    "1.0.0",
  network,
  recordedAt:
    new Date()
      .toISOString(),
  rawPublishJson: {
    path:
      input,
    sha256:
      crypto
        .createHash(
          "sha256",
        )
        .update(raw)
        .digest("hex"),
  },
  transactionDigest:
    digest,
  packageId,
  coinType,
  createdObjects:
    created.map(
      (change) => ({
        objectId:
          change.objectId ??
          null,
        objectType:
          change.objectType ??
          null,
        owner:
          change.owner ??
          null,
      }),
    ),
  bridgeControllerId:
    bridgeController
      ?.objectId ??
    null,
  metadataCapabilityId:
    metadataObject
      ?.objectId ??
    null,
  checkpoint:
    null,
  independentlyVerified:
    false,
};

fs.mkdirSync(
  path.dirname(output),
  {
    recursive:
      true,
  },
);

fs.writeFileSync(
  output,
  `${JSON.stringify(record, null, 2)}\n`,
);

console.log(
  JSON.stringify(
    record,
    null,
    2,
  ),
);

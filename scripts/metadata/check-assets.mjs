import fs from "node:fs";
import crypto from "node:crypto";

const failures = [];

const assets = [
  {
    file: "public/assets/pwrc.png",
    metadata:
      "metadata/metadata.json",
    symbol: "PWRC",
    localUri: "assets/pwrc.png",
  },
  {
    file: "public/assets/wpwrc.png",
    metadata:
      "metadata/wpwrc.metadata.json",
    symbol: "wPWRC",
    localUri: "assets/wpwrc.png",
  },
];

const PNG_SIGNATURE =
  "89504e470d0a1a0a";

const results = [];

for (const asset of assets) {
  if (!fs.existsSync(asset.file)) {
    failures.push(
      `${asset.symbol}:image-missing`,
    );
    continue;
  }

  const bytes =
    fs.readFileSync(asset.file);

  if (
    bytes.subarray(0, 8)
      .toString("hex") !==
    PNG_SIGNATURE
  ) {
    failures.push(
      `${asset.symbol}:not-png`,
    );
  }

  if (bytes.length < 10_000) {
    failures.push(
      `${asset.symbol}:image-too-small`,
    );
  }

  const metadata =
    JSON.parse(
      fs.readFileSync(
        asset.metadata,
        "utf8",
      ),
    );

  const local =
    metadata.properties
      ?.files
      ?.find(
        (file) =>
          file.cdn === false,
      );

  if (
    local?.uri !==
    asset.localUri
  ) {
    failures.push(
      `${asset.symbol}:local-uri`,
    );
  }

  if (
    local?.repository_path !==
    asset.file
  ) {
    failures.push(
      `${asset.symbol}:repository-path`,
    );
  }

  results.push({
    symbol: asset.symbol,
    file: asset.file,
    bytes: bytes.length,
    sha256:
      crypto
        .createHash("sha256")
        .update(bytes)
        .digest("hex"),
  });
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  assets: results,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}

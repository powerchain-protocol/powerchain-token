import fs from "node:fs";
import crypto from "node:crypto";
import {
  canonicalJsonStringify,
} from "./canonical-json.mjs";

export function sha256Buffer(
  value,
) {
  return crypto
    .createHash("sha256")
    .update(value)
    .digest("hex");
}

export function sha256Text(
  value,
) {
  return sha256Buffer(
    Buffer.from(
      String(value),
      "utf8",
    ),
  );
}

export function sha256FileSync(
  file,
) {
  return sha256Buffer(
    fs.readFileSync(file),
  );
}

export function canonicalJsonSha256(
  value,
) {
  return sha256Text(
    canonicalJsonStringify(
      value,
    ),
  );
}

export function randomHex(
  bytes,
) {
  if (
    !Number.isSafeInteger(bytes) ||
    bytes < 1 ||
    bytes > 1024
  ) {
    throw new Error(
      "POWERCHAIN_RANDOM_BYTES_INVALID",
    );
  }

  return crypto
    .randomBytes(bytes)
    .toString("hex");
}

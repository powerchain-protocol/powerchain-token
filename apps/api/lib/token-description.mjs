import fs from "node:fs";
import crypto from "node:crypto";

function canonicalJson(value) {
  if (
    value === null ||
    typeof value !== "object"
  ) {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(canonicalJson).join(",")}]`;
  }

  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
    .join(",")}}`;
}

const document = JSON.parse(
  fs.readFileSync(
    "config/token-description.json",
    "utf8",
  ),
);

const {
  descriptionSha256,
  ...descriptionPolicy
} = document;

const calculated = crypto
  .createHash("sha256")
  .update(canonicalJson(descriptionPolicy))
  .digest("hex");

if (calculated !== descriptionSha256) {
  throw new Error(
    "PWRC_TOKEN_DESCRIPTION_COMMITMENT_MISMATCH",
  );
}

if (
  descriptionPolicy.version !== "1.0.0" ||
  descriptionPolicy.canonical !== true ||
  descriptionPolicy.name !== "PowerChain" ||
  descriptionPolicy.symbol !== "PWRC" ||
  descriptionPolicy.domain !==
    "POWERCHAIN_PWRC_TOKEN_DESCRIPTION_V1"
) {
  throw new Error(
    "PWRC_TOKEN_DESCRIPTION_INVALID",
  );
}

for (const term of [
  "renewable-energy-related digital infrastructure",
  "digital payments",
  "cross-chain services",
  "protocol operations",
]) {
  if (!descriptionPolicy.description.includes(term)) {
    throw new Error(
      "PWRC_TOKEN_DESCRIPTION_REQUIRED_SCOPE_MISSING",
    );
  }
}

for (const prohibitedClaim of [
  "guaranteed return",
  "guaranteed yield",
  "ownership of renewable-energy assets",
]) {
  if (
    prohibitedClaim !==
      "ownership of renewable-energy assets" &&
    descriptionPolicy.description
      .toLowerCase()
      .includes(prohibitedClaim)
  ) {
    throw new Error(
      "PWRC_TOKEN_DESCRIPTION_PROHIBITED_CLAIM",
    );
  }
}

export function canonicalTokenDescription() {
  return {
    ...descriptionPolicy,
    descriptionSha256,
    publicWrites: false,
  };
}

import fs from "node:fs";
import {
  canonicalTokenDescription,
} from "../../apps/api/lib/token-description.mjs";
import {
  canonicalTokenProfile,
} from "../../apps/api/lib/token-policy.mjs";
import {
  publicMetadataState,
} from "../../apps/api/lib/metadata.mjs";
import {
  publicAssetRegistry,
} from "../../apps/api/lib/assets.mjs";

const failures = [];
const description = canonicalTokenDescription();
const profile = canonicalTokenProfile();
const metadata = publicMetadataState();
const assets = publicAssetRegistry();

for (const phrase of [
  "digital payments",
  "settlement",
  "cross-chain services",
  "application utilities",
  "protocol operations",
  "renewable-energy-related digital infrastructure",
]) {
  if (!description.description.includes(phrase)) {
    failures.push(`token-description:scope:${phrase}`);
  }
}

for (const phrase of [
  "does not represent equity",
  "ownership of energy assets",
  "carbon credits",
  "claim on company revenue",
]) {
  if (!description.description.includes(phrase)) {
    failures.push(`token-description:disclaimer:${phrase}`);
  }
}

if (
  !/^[a-f0-9]{64}$/.test(description.descriptionSha256) ||
  description.domain !== "POWERCHAIN_PWRC_TOKEN_DESCRIPTION_V1"
) {
  failures.push("token-description:commitment");
}

if (
  profile.descriptionSha256 !== description.descriptionSha256 ||
  metadata.descriptionSha256 !== description.descriptionSha256 ||
  metadata.renewableEnergyRelated !== true
) {
  failures.push("token-description:api-parity");
}

for (const asset of assets.assets) {
  if (
    asset.descriptionPolicySha256 !== description.descriptionSha256 ||
    typeof asset.description !== "string" ||
    asset.description.length < 60
  ) {
    failures.push(`token-description:asset:${asset.symbol}`);
  }
}

const nativeMetadata = JSON.parse(
  fs.readFileSync("metadata/metadata.json", "utf8"),
);
const wrappedMetadata = JSON.parse(
  fs.readFileSync("metadata/wpwrc.json", "utf8"),
);

if (
  nativeMetadata.description !== description.description ||
  nativeMetadata.properties?.description_policy?.sha256 !== description.descriptionSha256 ||
  wrappedMetadata.description !== description.wrappedDescription ||
  wrappedMetadata.properties?.description_policy?.sha256 !== description.descriptionSha256
) {
  failures.push("token-description:published-metadata-parity");
}

const tokenPolicy = JSON.parse(
  fs.readFileSync("config/token-policy.json", "utf8"),
);
if (
  tokenPolicy.policySha256 !==
  "cfaac8d0c647bf3e62da51996f07a3c96e6445697bdedbe56d38a0318fb353d4"
) {
  failures.push("token-description:token-policy-changed");
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  domain: description.domain,
  descriptionSha256: description.descriptionSha256,
  renewableEnergyRelated: true,
  metadataParity: true,
  assetParity: true,
  tokenPolicyUnchanged: true,
  publicWrites: false,
  failures,
}, null, 2));

if (failures.length) process.exit(1);

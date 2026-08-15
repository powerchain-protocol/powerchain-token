import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  canonicalTokenDescription,
} from "../apps/api/lib/token-description.mjs";
import {
  canonicalTokenProfile,
} from "../apps/api/lib/token-policy.mjs";
import {
  publicMetadataState,
} from "../apps/api/lib/metadata.mjs";
import {
  publicAssetRegistry,
} from "../apps/api/lib/assets.mjs";

test("canonical PWRC description includes professional utility and renewable-energy scope", () => {
  const description = canonicalTokenDescription();

  assert.equal(description.version, "1.0.0");
  assert.equal(description.domain, "POWERCHAIN_PWRC_TOKEN_DESCRIPTION_V1");
  assert.match(description.descriptionSha256, /^[a-f0-9]{64}$/);

  for (const phrase of [
    "digital payments",
    "settlement",
    "cross-chain services",
    "application utilities",
    "protocol operations",
    "renewable-energy-related digital infrastructure",
  ]) {
    assert.ok(description.description.includes(phrase));
  }
});

test("description is explicit about non-investment and non-energy-ownership claims", () => {
  const description = canonicalTokenDescription();

  for (const phrase of [
    "does not represent equity",
    "debt",
    "dividends",
    "ownership of energy assets",
    "carbon credits",
    "claim on company revenue",
  ]) {
    assert.ok(description.description.includes(phrase));
  }
});

test("metadata, token profile and asset registry share the description commitment", () => {
  const description = canonicalTokenDescription();
  const profile = canonicalTokenProfile();
  const metadata = publicMetadataState();
  const assets = publicAssetRegistry();

  assert.equal(profile.descriptionSha256, description.descriptionSha256);
  assert.equal(metadata.descriptionSha256, description.descriptionSha256);
  assert.equal(metadata.renewableEnergyRelated, true);
  assert.equal(assets.assets.length, 2);

  for (const asset of assets.assets) {
    assert.equal(asset.descriptionPolicySha256, description.descriptionSha256);
    assert.match(asset.description, /PowerChain|PWRC/);
  }
});

test("published metadata files bind the description policy", () => {
  const description = canonicalTokenDescription();
  const native = JSON.parse(fs.readFileSync("metadata/metadata.json", "utf8"));
  const wrapped = JSON.parse(fs.readFileSync("metadata/wpwrc.json", "utf8"));

  assert.equal(native.description, description.description);
  assert.equal(native.properties.description_policy.sha256, description.descriptionSha256);
  assert.equal(wrapped.description, description.wrappedDescription);
  assert.equal(wrapped.properties.description_policy.sha256, description.descriptionSha256);
});

test("API, SDK and OpenAPI expose the description resource", () => {
  const server = fs.readFileSync("apps/api/server.mjs", "utf8");
  const registry = fs.readFileSync("apps/api/lib/api-registry.mjs", "utf8");
  const sdk = fs.readFileSync("packages/sdk/src/api-client.ts", "utf8");
  const spec = JSON.parse(fs.readFileSync("swagger/openapi.json", "utf8"));

  assert.ok(server.includes('"/api/v1/token/description"'));
  assert.ok(registry.includes('path: "/api/v1/token/description"'));
  assert.ok(sdk.includes("tokenDescription()"));
  assert.ok(spec.paths["/api/v1/token/description"]);
  assert.ok(spec.components.schemas.TokenDescriptionResponse);
});

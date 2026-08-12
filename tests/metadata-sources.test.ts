import test from "node:test";
import assert from "node:assert/strict";
import {
  PWRC_PRIMARY_METADATA_URI,
  WPWRC_PRIMARY_METADATA_URI,
  fetchMetadataWithGithubFallback,
} from "../client/metadata.js";

test("canonical metadata domain is token.powerchain.energy", () => {
  assert.equal(
    PWRC_PRIMARY_METADATA_URI,
    "https://token.powerchain.energy/metadata/metadata.json",
  );
  assert.equal(
    WPWRC_PRIMARY_METADATA_URI,
    "https://token.powerchain.energy/metadata/wpwrc.metadata.json",
  );
});

test("rejects non-GitHub secondary metadata hosts", async () => {
  const fakeAxios = {
    get: async () => {
      throw new Error("PRIMARY_DOWN");
    },
  } as any;

  await assert.rejects(
    () =>
      fetchMetadataWithGithubFallback({
        primary: "https://token.powerchain.energy/metadata/metadata.json",
        secondary: "https://example.com/metadata.json",
        axiosInstance: fakeAxios,
      }),
    /METADATA_SECONDARY_MUST_BE_GITHUB/,
  );
});

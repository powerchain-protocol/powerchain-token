import test from "node:test";
import assert from "node:assert/strict";
import {
  POWERCHAIN_OFFICIAL_LINKS,
  assertCanonicalOfficialLinks,
} from "../packages/protocol/src/metadata/official-links.js";

test("canonical official links are pinned", () => {
  assert.deepEqual(POWERCHAIN_OFFICIAL_LINKS, {
    website: "https://powerchain.energy",
    bridge: "https://bridge.powerchain.energy",
    app: "https://app.powerchain.energy",
    documentation: "https://docs.powerchain.energy",
    whitepaper: "https://whitepaper.powerchain.energy",
    x: "https://x.com/powerchain_ai",
    telegram: "https://t.me/powerchain_official",
  });
});

test("metadata requires all canonical official links", () => {
  assert.doesNotThrow(() =>
    assertCanonicalOfficialLinks({
      external_url: POWERCHAIN_OFFICIAL_LINKS.website,
      official_links: POWERCHAIN_OFFICIAL_LINKS,
      properties: {
        links: POWERCHAIN_OFFICIAL_LINKS,
      },
    }),
  );
});

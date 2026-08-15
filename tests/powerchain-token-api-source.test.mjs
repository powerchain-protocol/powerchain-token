import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  powerChainTokenApiIndex,
  publicAssetBySymbol,
  publicAssetRegistry,
} from "../apps/api/lib/assets.mjs";
import {
  publicMetadataState,
} from "../apps/api/lib/metadata.mjs";
import {
  publicFeePolicy,
} from "../apps/api/lib/public-platform.mjs";

test(
  "PowerChain token API index exposes the canonical namespace",
  () => {
    const index =
      powerChainTokenApiIndex();

    assert.equal(
      index.product,
      "PowerChain Token API",
    );
    assert.equal(
      index.resource,
      "PWRC",
    );
    assert.equal(
      index.publicWrites,
      false,
    );
    assert.equal(
      index.endpoints.metadata,
      "/api/v1/token/metadata",
    );
    assert.equal(
      index.endpoints.fees,
      "/api/v1/token/fees",
    );
    assert.equal(
      index.endpoints.assets,
      "/api/v1/assets",
    );
  },
);

test(
  "asset registry contains canonical PWRC and wrapped wPWRC only",
  () => {
    const registry =
      publicAssetRegistry();

    assert.equal(
      registry.count,
      2,
    );
    assert.deepEqual(
      registry.assets.map(
        (asset) =>
          asset.symbol,
      ),
      [
        "PWRC",
        "wPWRC",
      ],
    );
    assert.equal(
      registry.publicWrites,
      false,
    );

    const pwrc =
      publicAssetBySymbol(
        "pwrc",
      );
    const wpwrc =
      publicAssetBySymbol(
        "wPWRC",
      );

    assert.equal(
      pwrc?.canonical,
      true,
    );
    assert.equal(
      pwrc?.standard,
      "Token-2022",
    );
    assert.equal(
      wpwrc?.wrapped,
      true,
    );
    assert.equal(
      wpwrc?.canonicalAsset,
      "PWRC",
    );
  },
);

test(
  "metadata and fee policy are token-policy bound",
  () => {
    const metadata =
      publicMetadataState();
    const fees =
      publicFeePolicy({});

    assert.equal(
      metadata.tokenPolicySha256,
      fees.tokenPolicySha256,
    );
    assert.equal(
      metadata.publicWrites,
      false,
    );
    assert.equal(
      fees.nativeToken2022Fee
        .basisPoints,
      250,
    );
    assert.equal(
      fees.nativeToken2022Fee
        .feeCapStartsAtGrossBaseUnits,
      "40000000000000000",
    );
  },
);

test(
  "unknown and malformed asset symbols fail safely",
  () => {
    assert.equal(
      publicAssetBySymbol(
        "unknown",
      ),
      null,
    );
    assert.throws(
      () =>
        publicAssetBySymbol(
          "../PWRC",
        ),
      /PWRC_ASSET_SYMBOL_INVALID/,
    );
  },
);

test(
  "server and OpenAPI expose the token and asset namespaces",
  () => {
    const server =
      fs.readFileSync(
        "apps/api/server.mjs",
        "utf8",
      );
    const registry =
      fs.readFileSync(
        "apps/api/lib/api-registry.mjs",
        "utf8",
      );
    const spec =
      JSON.parse(
        fs.readFileSync(
          "swagger/openapi.json",
          "utf8",
        ),
      );

    for (const path of [
      "/api/v1/token/metadata",
      "/api/v1/token/fees",
      "/api/v1/assets",
      "/api/v1/assets/{symbol}",
    ]) {
      assert.ok(
        registry.includes(
          path,
        ),
      );
      assert.ok(
        spec.paths[path],
      );
    }

    assert.ok(
      server.includes(
        '"/api/v1/assets/"',
      ),
    );
    assert.ok(
      server.includes(
        '"/api/v1/token/"',
      ),
    );
  },
);

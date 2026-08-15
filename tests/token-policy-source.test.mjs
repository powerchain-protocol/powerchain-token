import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";

function canonicalJson(
  value,
) {
  if (
    value === null ||
    typeof value !==
      "object"
  ) {
    return JSON.stringify(
      value,
    );
  }

  if (Array.isArray(value)) {
    return `[${value
      .map(canonicalJson)
      .join(",")}]`;
  }

  return `{${Object
    .keys(value)
    .sort()
    .map(
      (key) =>
        `${JSON.stringify(key)}:${canonicalJson(value[key])}`,
    )
    .join(",")}}`;
}

const policyDocument =
  JSON.parse(
    fs.readFileSync(
      "config/token-policy.json",
      "utf8",
    ),
  );
const {
  policySha256,
  ...policy
} =
  policyDocument;

test(
  "canonical PWRC token policy commitment is deterministic",
  () => {
    const actual =
      crypto
        .createHash(
          "sha256",
        )
        .update(
          canonicalJson({
            domain:
              "POWERCHAIN_PWRC_TOKEN_POLICY_V1",
            policy,
          }),
        )
        .digest(
          "hex",
        );

    assert.equal(
      actual,
      policySha256,
    );
    assert.equal(
      policySha256,
      "cfaac8d0c647bf3e62da51996f07a3c96e6445697bdedbe56d38a0318fb353d4",
    );
  },
);

test(
  "canonical token economics are pinned",
  () => {
    assert.equal(
      policy.native.fixedSupplyBaseUnits,
      "18446000000000000000",
    );
    assert.equal(
      policy.native.u64HeadroomBaseUnits,
      "744073709551615",
    );
    assert.equal(
      policy.native.transferFee.basisPoints,
      "250",
    );
    assert.equal(
      policy.native.transferFee.maximumFeeBaseUnits,
      "1000000000000000",
    );
    assert.equal(
      policy.native.transferFee.capStartsAtGrossBaseUnits,
      "40000000000000000",
    );
    assert.deepEqual(
      policy.native.extensions,
      [
        "TransferFeeConfig",
        "MetadataPointer",
        "TokenMetadata",
      ],
    );
  },
);

test(
  "wrapped representation is zero-genesis and one-to-one in base units",
  () => {
    assert.equal(
      policy.wrapped.genesisSupplyBaseUnits,
      "0",
    );
    assert.equal(
      policy.wrapped.maxWrappedSupplyBaseUnits,
      policy.native.fixedSupplyBaseUnits,
    );
    assert.equal(
      policy.wrapped.canonicalBaseUnitsPerWrappedBaseUnit,
      "1",
    );
  },
);

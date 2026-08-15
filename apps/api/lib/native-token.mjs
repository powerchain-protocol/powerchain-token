import crypto from "node:crypto";
import {
  canonicalNativeTokenPolicy,
} from "./token-policy.mjs";

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

  if (
    Array.isArray(
      value,
    )
  ) {
    return `[${value
      .map(
        canonicalJson,
      )
      .join(",")}]`;
  }

  return `{${Object
    .keys(value)
    .sort()
    .filter(
      (key) =>
        value[key] !==
        undefined,
    )
    .map(
      (key) =>
        `${JSON.stringify(key)}:${canonicalJson(value[key])}`,
    )
    .join(",")}}`;
}

function canonicalJsonSha256(
  value,
) {
  return crypto
    .createHash(
      "sha256",
    )
    .update(
      canonicalJson(
        value,
      ),
    )
    .digest(
      "hex",
    );
}

export function nativePwrcPolicyPayload() {
  return canonicalNativeTokenPolicy();
}

export function nativePwrcPolicySha256() {
  return canonicalJsonSha256({
    domain:
      "POWERCHAIN_NATIVE_PWRC_POLICY_V1",
    policy:
      nativePwrcPolicyPayload(),
  });
}

export function nativePwrcPolicy() {
  return {
    ...nativePwrcPolicyPayload(),
    policySha256:
      nativePwrcPolicySha256(),
  };
}

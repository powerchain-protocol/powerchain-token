import {
  assertHttpsUrl as assertHttpsUrlShared,
} from "../../packages/runtime/src/network.mjs";
import {
  canonicalJsonSha256 as canonicalJsonSha256Shared,
} from "../../packages/runtime/src/crypto.mjs";
import {
  assertSha256Hex,
} from "../../packages/runtime/src/validation.mjs";

const BASE58 =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function decodeBase58(value) {
  if (
    typeof value !== "string" ||
    value.length < 32 ||
    value.length > 64
  ) {
    throw new Error(
      "PWRC_SOLANA_ADDRESS_INVALID",
    );
  }

  let number = 0n;

  for (const character of value) {
    const index =
      BASE58.indexOf(character);

    if (index < 0) {
      throw new Error(
        "PWRC_SOLANA_ADDRESS_INVALID",
      );
    }

    number =
      number * 58n +
      BigInt(index);
  }

  const bytes = [];

  while (number > 0n) {
    bytes.push(
      Number(number % 256n),
    );
    number /= 256n;
  }

  bytes.reverse();

  let leadingZeroes = 0;
  while (
    leadingZeroes <
      value.length &&
    value[leadingZeroes] === "1"
  ) {
    leadingZeroes += 1;
  }

  return new Uint8Array([
    ...new Array(
      leadingZeroes,
    ).fill(0),
    ...bytes,
  ]);
}

export function assertSolanaPublicKey(
  value,
  label,
) {
  let bytes;

  try {
    bytes =
      decodeBase58(value);
  } catch {
    throw new Error(
      `${label}:invalid-base58`,
    );
  }

  if (bytes.length !== 32) {
    throw new Error(
      `${label}:must-decode-to-32-bytes`,
    );
  }

  if (
    value ===
    "11111111111111111111111111111111"
  ) {
    throw new Error(
      `${label}:system-program-forbidden`,
    );
  }

  return value;
}

export function assertSuiObjectId(
  value,
  label,
) {
  if (
    typeof value !== "string" ||
    !/^0x[a-f0-9]{64}$/i.test(
      value,
    )
  ) {
    throw new Error(
      `${label}:invalid-sui-id`,
    );
  }

  return value.toLowerCase();
}

export function assertSha256(
  value,
  label,
) {
  return assertSha256Hex(
    value,
    label,
  );
}

export function assertHttpsUrl(
  value,
  label,
) {
  return assertHttpsUrlShared(
    value,
    label,
  );
}

export function canonicalJsonSha256(
  value,
) {
  return canonicalJsonSha256Shared(
    value,
  );
}

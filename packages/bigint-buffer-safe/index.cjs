"use strict";

const {
  Buffer,
} = require("buffer");


const MAX_BUFFER_BYTES = 1024 * 1024;

function assertByteView(value) {
  if (
    !Buffer.isBuffer(value) &&
    !(value instanceof Uint8Array)
  ) {
    throw new TypeError(
      "bigint-buffer input must be a Buffer or Uint8Array",
    );
  }

  if (
    value.byteLength >
    MAX_BUFFER_BYTES
  ) {
    throw new RangeError(
      `bigint-buffer input exceeds ${MAX_BUFFER_BYTES} byte safety limit`,
    );
  }
}

function assertWidth(width) {
  if (
    !Number.isSafeInteger(width) ||
    width < 0 ||
    width > MAX_BUFFER_BYTES
  ) {
    throw new RangeError(
      `bigint-buffer width must be an integer between 0 and ${MAX_BUFFER_BYTES}`,
    );
  }
}

function normalizeBigInt(value) {
  const result =
    typeof value === "bigint"
      ? value
      : BigInt(value);

  if (result < 0n) {
    throw new RangeError(
      "bigint-buffer only supports unsigned bigint values",
    );
  }

  return result;
}

function bytesToBigIntBE(input) {
  assertByteView(input);

  if (input.byteLength === 0) {
    return 0n;
  }

  const bytes =
    Buffer.from(
      input.buffer,
      input.byteOffset,
      input.byteLength,
    );

  const hex =
    bytes.toString("hex");

  return hex
    ? BigInt(`0x${hex}`)
    : 0n;
}

function bytesToBigIntLE(input) {
  assertByteView(input);

  if (input.byteLength === 0) {
    return 0n;
  }

  const bytes =
    Buffer.from(
      input.buffer,
      input.byteOffset,
      input.byteLength,
    );

  const hex =
    Buffer.from(bytes)
      .reverse()
      .toString("hex");

  return hex
    ? BigInt(`0x${hex}`)
    : 0n;
}

function bigintToBufferBE(value, width) {
  assertWidth(width);

  if (width === 0) {
    return Buffer.alloc(0);
  }

  const normalized =
    normalizeBigInt(value);

  const targetHexLength =
    width * 2;

  let hex =
    normalized.toString(16);

  if (hex.length % 2 !== 0) {
    hex = `0${hex}`;
  }

  if (
    hex.length >
    targetHexLength
  ) {
    hex =
      hex.slice(
        -targetHexLength,
      );
  } else {
    hex =
      hex.padStart(
        targetHexLength,
        "0",
      );
  }

  return Buffer.from(
    hex,
    "hex",
  );
}

function bigintToBufferLE(value, width) {
  return Buffer.from(
    bigintToBufferBE(
      value,
      width,
    ),
  ).reverse();
}


module.exports = {
  toBigIntBE:
    bytesToBigIntBE,
  toBigIntLE:
    bytesToBigIntLE,
  toBufferBE:
    bigintToBufferBE,
  toBufferLE:
    bigintToBufferLE,
  MAX_BUFFER_BYTES,
};

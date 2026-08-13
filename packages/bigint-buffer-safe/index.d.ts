/// <reference types="node" />

export declare const MAX_BUFFER_BYTES: number;

export declare function toBigIntBE(
  input: Buffer | Uint8Array,
): bigint;

export declare function toBigIntLE(
  input: Buffer | Uint8Array,
): bigint;

export declare function toBufferBE(
  value: bigint | number | string,
  width: number,
): Buffer;

export declare function toBufferLE(
  value: bigint | number | string,
  width: number,
): Buffer;

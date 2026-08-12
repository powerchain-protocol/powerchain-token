import { createHash, randomBytes } from "node:crypto";
import { Transaction } from "@mysten/sui/transactions";

export const WPWRC_DECIMALS = 9 as const;
export const WPWRC_MAX_BASE_UNITS = 18_446_000_000_000_000_000n;
export const PWRC_CANONICAL_DECIMALS = 9 as const;
export const PWRC_BASE_UNITS_PER_WPWRC_BASE_UNIT = 1n;
export const PWRC_CANONICAL_MAX_BASE_UNITS = 18_446_000_000_000_000_000n;

export interface WpwrcDeployment {
  packageId: string;
  bridgeControllerId: string;
}

function assertObjectId(value: string, code: string): void {
  if (!/^0x[a-fA-F0-9]{1,64}$/.test(value)) throw new Error(code);
}

export interface SolanaPwrcLockClaim {
  version: "1.0.0";
  sourceChain: "solana";
  cluster: "devnet" | "mainnet-beta";
  canonicalMint: string;
  lockVault: string;
  signature: string;
  instructionIndex: number;
  amountBaseUnits: bigint;
  suiRecipient: string;
}

function lengthPrefixed(value: string): Buffer {
  const bytes = Buffer.from(value, "utf8");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(bytes.length, 0);
  return Buffer.concat([length, bytes]);
}

function u64be(value: bigint): Buffer {
  if (value < 0n || value > 18_446_744_073_709_551_615n) {
    throw new Error("WPWRC_U64_INVALID");
  }
  const out = Buffer.alloc(8);
  out.writeBigUInt64BE(value);
  return out;
}

function u32be(value: number): Buffer {
  if (!Number.isInteger(value) || value < 0 || value > 0xffff_ffff) {
    throw new Error("WPWRC_U32_INVALID");
  }
  const out = Buffer.alloc(4);
  out.writeUInt32BE(value);
  return out;
}

export function assertSolanaPwrcLockClaim(claim: SolanaPwrcLockClaim): void {
  if (claim.version !== "1.0.0") throw new Error("WPWRC_CLAIM_VERSION_INVALID");
  if (claim.sourceChain !== "solana") throw new Error("WPWRC_CLAIM_SOURCE_CHAIN_INVALID");
  if (claim.cluster !== "devnet" && claim.cluster !== "mainnet-beta") {
    throw new Error("WPWRC_CLAIM_CLUSTER_INVALID");
  }
  if (!claim.canonicalMint) throw new Error("WPWRC_CLAIM_MINT_REQUIRED");
  if (!claim.lockVault) throw new Error("WPWRC_CLAIM_LOCK_VAULT_REQUIRED");
  if (!claim.signature) throw new Error("WPWRC_CLAIM_SIGNATURE_REQUIRED");
  if (!Number.isInteger(claim.instructionIndex) || claim.instructionIndex < 0) {
    throw new Error("WPWRC_CLAIM_INSTRUCTION_INDEX_INVALID");
  }
  if (claim.amountBaseUnits <= 0n) throw new Error("WPWRC_CLAIM_ZERO_AMOUNT");
  if (claim.amountBaseUnits > PWRC_CANONICAL_MAX_BASE_UNITS) throw new Error("WPWRC_CLAIM_EXCEEDS_CANONICAL_MAX");
  if (!/^0x[a-fA-F0-9]{1,64}$/.test(claim.suiRecipient)) {
    throw new Error("WPWRC_CLAIM_SUI_RECIPIENT_INVALID");
  }
}


export function canonicalAmountToWrappedAmountExact(
  canonicalBaseUnits: bigint,
): bigint {
  if (canonicalBaseUnits <= 0n) {
    throw new Error(
      "WPWRC_CANONICAL_AMOUNT_MUST_BE_POSITIVE",
    );
  }
  if (canonicalBaseUnits > WPWRC_MAX_BASE_UNITS) {
    throw new Error("WPWRC_AMOUNT_EXCEEDS_MAX");
  }
  return canonicalBaseUnits;
}

export function wrappedAmountToCanonicalAmount(
  wrappedBaseUnits: bigint,
): bigint {
  if (wrappedBaseUnits < 0n) {
    throw new Error("WPWRC_WRAPPED_AMOUNT_NEGATIVE");
  }
  if (wrappedBaseUnits > WPWRC_MAX_BASE_UNITS) {
    throw new Error("WPWRC_AMOUNT_EXCEEDS_MAX");
  }
  return wrappedBaseUnits;
}


/**
 * Domain-separated bridge claim hash.
 *
 * The hash commits to the source transaction identity AND all mint-critical
 * parameters. The same Solana signature cannot be reused with a different
 * amount, recipient, mint, vault, or instruction index.
 */
export function solanaPwrcLockClaimHash(
  claim: SolanaPwrcLockClaim,
): Uint8Array {
  assertSolanaPwrcLockClaim(claim);

  const payload = Buffer.concat([
    lengthPrefixed("powerchain:solana-to-sui:wpwrc:v1"),
    lengthPrefixed(claim.cluster),
    lengthPrefixed(claim.canonicalMint),
    lengthPrefixed(claim.lockVault),
    lengthPrefixed(claim.signature),
    u32be(claim.instructionIndex),
    u64be(claim.amountBaseUnits),
    lengthPrefixed(claim.suiRecipient.toLowerCase()),
  ]);

  return createHash("sha256").update(payload).digest();
}

/** @deprecated Prefer solanaPwrcLockClaimHash with all claim fields bound. */
export function bridgeMessageHash(input: {
  sourceChain: "solana";
  cluster: string;
  signature: string;
  instructionIndex?: number;
}): Uint8Array {
  const payload = [
    "powerchain:bridge-message:legacy:v1",
    input.sourceChain,
    input.cluster,
    input.signature,
    String(input.instructionIndex ?? 0),
  ].join(":");
  return createHash("sha256").update(payload).digest();
}

export function newBurnReference(): Uint8Array {
  return randomBytes(32);
}

export function buildWpwrcMintTransaction(input: {
  deployment: WpwrcDeployment;
  sourceMessageHash: Uint8Array;
  wrappedAmountBaseUnits: bigint;
  recipient: string;
}): Transaction {
  assertObjectId(input.deployment.packageId, "WPWRC_PACKAGE_ID_INVALID");
  assertObjectId(input.deployment.bridgeControllerId, "WPWRC_CONTROLLER_ID_INVALID");
  assertObjectId(input.recipient, "WPWRC_RECIPIENT_INVALID");
  if (input.sourceMessageHash.length !== 32) throw new Error("WPWRC_SOURCE_HASH_INVALID");
  if (input.wrappedAmountBaseUnits <= 0n) throw new Error("WPWRC_MINT_ZERO_AMOUNT");
  if (input.wrappedAmountBaseUnits > WPWRC_MAX_BASE_UNITS) throw new Error("WPWRC_MINT_EXCEEDS_MAX");

  const tx = new Transaction();
  tx.moveCall({
    target: `${input.deployment.packageId}::bridge::mint_from_bridge`,
    arguments: [
      tx.object(input.deployment.bridgeControllerId),
      tx.pure.u64(input.wrappedAmountBaseUnits),
      tx.pure.address(input.recipient),
      tx.pure.vector("u8", [...input.sourceMessageHash]),
    ],
  });
  return tx;
}


/**
 * Preferred bridge mint builder.
 *
 * Claim amounts and Sui mint amounts use the same 9-decimal base-unit domain.
 * No decimal conversion or rounding is performed.
 */
export function buildWpwrcMintFromBridgeClaim(input: {
  deployment: WpwrcDeployment;
  claim: SolanaPwrcLockClaim;
}): Transaction {
  assertSolanaPwrcLockClaim(input.claim);

  const sourceMessageHash =
    solanaPwrcLockClaimHash(input.claim);
  const wrappedAmountBaseUnits =
    canonicalAmountToWrappedAmountExact(
      input.claim.amountBaseUnits,
    );

  return buildWpwrcMintTransaction({
    deployment: input.deployment,
    sourceMessageHash,
    wrappedAmountBaseUnits,
    recipient: input.claim.suiRecipient,
  });
}

export function buildWpwrcBurnTransaction(input: {
  deployment: WpwrcDeployment;
  coinObjectId: string;
  destinationSolanaAddressBytes: Uint8Array;
  burnReference?: Uint8Array;
}): Transaction {
  assertObjectId(
    input.deployment.packageId,
    "WPWRC_PACKAGE_ID_INVALID",
  );
  assertObjectId(
    input.deployment.bridgeControllerId,
    "WPWRC_CONTROLLER_ID_INVALID",
  );
  assertObjectId(
    input.coinObjectId,
    "WPWRC_COIN_OBJECT_ID_INVALID",
  );
  if (input.destinationSolanaAddressBytes.length !== 32) {
    throw new Error(
      "WPWRC_SOLANA_DESTINATION_BYTES_INVALID",
    );
  }

  const reference =
    input.burnReference ?? newBurnReference();
  assertWpwrcBurnReference(reference);

  const tx = new Transaction();
  tx.moveCall({
    target:
      `${input.deployment.packageId}::bridge::burn_for_solana`,
    arguments: [
      tx.object(input.deployment.bridgeControllerId),
      tx.object(input.coinObjectId),
      tx.pure.vector(
        "u8",
        [...input.destinationSolanaAddressBytes],
      ),
      tx.pure.vector("u8", [...reference]),
    ],
  });
  return tx;
}


export function buildWpwrcFinalizeRegistrationTransaction(input: {
  packageId: string;
  currencyObjectId: string;
}): Transaction {
  assertObjectId(input.packageId, "WPWRC_PACKAGE_ID_INVALID");
  assertObjectId(input.currencyObjectId, "WPWRC_CURRENCY_OBJECT_ID_INVALID");

  const tx = new Transaction();
  tx.moveCall({
    target: "0x2::coin_registry::finalize_registration",
    typeArguments: [`${input.packageId}::wpwrc::WPWRC`],
    arguments: [
      tx.object("0xc"),
      tx.object(input.currencyObjectId),
    ],
  });
  return tx;
}

export function assertWpwrcBurnReference(
  burnReference: Uint8Array,
): void {
  if (burnReference.length !== 32) {
    throw new Error("WPWRC_BURN_REFERENCE_LENGTH_INVALID");
  }
}

export function buildWpwrcBurnForSolana(input: {
  deployment: WpwrcDeployment;
  coinObjectId: string;
  destinationSolanaAddressBytes: Uint8Array;
  burnReference: Uint8Array;
}): Transaction {
  if (input.destinationSolanaAddressBytes.length !== 32) {
    throw new Error("WPWRC_SOLANA_DESTINATION_BYTES_INVALID");
  }
  assertWpwrcBurnReference(input.burnReference);

  return buildWpwrcBurnTransaction({
    deployment: input.deployment,
    coinObjectId: input.coinObjectId,
    destinationSolanaAddressBytes:
      input.destinationSolanaAddressBytes,
    burnReference: input.burnReference,
  });
}

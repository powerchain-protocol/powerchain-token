import { createHash, randomBytes } from "node:crypto";
import { Transaction } from "@mysten/sui/transactions";

export const WPWRC_DECIMALS = 9 as const;
export const WPWRC_MAX_BASE_UNITS = 18_446_000_000_000_000_000n;

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
  if (claim.amountBaseUnits > WPWRC_MAX_BASE_UNITS) throw new Error("WPWRC_CLAIM_EXCEEDS_MAX");
  if (!/^0x[a-fA-F0-9]{1,64}$/.test(claim.suiRecipient)) {
    throw new Error("WPWRC_CLAIM_SUI_RECIPIENT_INVALID");
  }
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
  amountBaseUnits: bigint;
  recipient: string;
}): Transaction {
  assertObjectId(input.deployment.packageId, "WPWRC_PACKAGE_ID_INVALID");
  assertObjectId(input.deployment.bridgeControllerId, "WPWRC_CONTROLLER_ID_INVALID");
  if (input.sourceMessageHash.length !== 32) throw new Error("WPWRC_SOURCE_HASH_INVALID");
  if (input.amountBaseUnits <= 0n) throw new Error("WPWRC_MINT_ZERO_AMOUNT");
  if (input.amountBaseUnits > WPWRC_MAX_BASE_UNITS) throw new Error("WPWRC_MINT_EXCEEDS_MAX");

  const tx = new Transaction();
  tx.moveCall({
    target: `${input.deployment.packageId}::wpwrc::mint_from_bridge`,
    arguments: [
      tx.object(input.deployment.bridgeControllerId),
      tx.pure.vector("u8", [...input.sourceMessageHash]),
      tx.pure.u64(input.amountBaseUnits),
      tx.pure.address(input.recipient),
    ],
  });
  return tx;
}

export function buildWpwrcBurnTransaction(input: {
  deployment: WpwrcDeployment;
  coinObjectId: string;
  destinationChain: number;
  destination: Uint8Array;
  burnReference?: Uint8Array;
}): Transaction {
  assertObjectId(input.deployment.packageId, "WPWRC_PACKAGE_ID_INVALID");
  assertObjectId(input.deployment.bridgeControllerId, "WPWRC_CONTROLLER_ID_INVALID");
  assertObjectId(input.coinObjectId, "WPWRC_COIN_OBJECT_ID_INVALID");
  if (!Number.isInteger(input.destinationChain) || input.destinationChain < 0 || input.destinationChain > 65535) {
    throw new Error("WPWRC_DESTINATION_CHAIN_INVALID");
  }
  if (input.destination.length === 0 || input.destination.length > 128) {
    throw new Error("WPWRC_DESTINATION_INVALID");
  }

  const reference = input.burnReference ?? newBurnReference();
  if (reference.length !== 32) throw new Error("WPWRC_BURN_REFERENCE_INVALID");

  const tx = new Transaction();
  tx.moveCall({
    target: `${input.deployment.packageId}::wpwrc::burn_for_bridge`,
    arguments: [
      tx.object(input.deployment.bridgeControllerId),
      tx.object(input.coinObjectId),
      tx.pure.u16(input.destinationChain),
      tx.pure.vector("u8", [...input.destination]),
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

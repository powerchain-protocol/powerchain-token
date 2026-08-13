import { Transaction } from "@mysten/sui/transactions";
export declare const WPWRC_DECIMALS: 9;
export declare const WPWRC_MAX_BASE_UNITS = 18446000000000000000n;
export declare const PWRC_CANONICAL_DECIMALS: 9;
export declare const PWRC_BASE_UNITS_PER_WPWRC_BASE_UNIT = 1n;
export declare const PWRC_CANONICAL_MAX_BASE_UNITS = 18446000000000000000n;
export interface WpwrcDeployment {
    packageId: string;
    bridgeControllerId: string;
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
export declare function assertSolanaPwrcLockClaim(claim: SolanaPwrcLockClaim): void;
export declare function canonicalAmountToWrappedAmountExact(canonicalBaseUnits: bigint): bigint;
export declare function wrappedAmountToCanonicalAmount(wrappedBaseUnits: bigint): bigint;
/**
 * Domain-separated bridge claim hash.
 *
 * The hash commits to the source transaction identity AND all mint-critical
 * parameters. The same Solana signature cannot be reused with a different
 * amount, recipient, mint, vault, or instruction index.
 */
export declare function solanaPwrcLockClaimHash(claim: SolanaPwrcLockClaim): Uint8Array;
/** @deprecated Prefer solanaPwrcLockClaimHash with all claim fields bound. */
export declare function bridgeMessageHash(input: {
    sourceChain: "solana";
    cluster: string;
    signature: string;
    instructionIndex?: number;
}): Uint8Array;
export declare function newBurnReference(): Uint8Array;
export declare function buildWpwrcMintTransaction(input: {
    deployment: WpwrcDeployment;
    sourceMessageHash: Uint8Array;
    wrappedAmountBaseUnits: bigint;
    recipient: string;
}): Transaction;
/**
 * Preferred bridge mint builder.
 *
 * Claim amounts and Sui mint amounts use the same 9-decimal base-unit domain.
 * No decimal conversion or rounding is performed.
 */
export declare function buildWpwrcMintFromBridgeClaim(input: {
    deployment: WpwrcDeployment;
    claim: SolanaPwrcLockClaim;
}): Transaction;
export declare function buildWpwrcBurnTransaction(input: {
    deployment: WpwrcDeployment;
    coinObjectId: string;
    destinationSolanaAddressBytes: Uint8Array;
    burnReference?: Uint8Array;
}): Transaction;
export declare function buildWpwrcFinalizeRegistrationTransaction(input: {
    packageId: string;
    currencyObjectId: string;
}): Transaction;
export declare function assertWpwrcBurnReference(burnReference: Uint8Array): void;
export declare function buildWpwrcBurnForSolana(input: {
    deployment: WpwrcDeployment;
    coinObjectId: string;
    destinationSolanaAddressBytes: Uint8Array;
    burnReference: Uint8Array;
}): Transaction;
//# sourceMappingURL=wpwrc.d.ts.map
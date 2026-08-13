import { PublicKey } from "@solana/web3.js";
export declare const PWRC_LOCK_PROGRAM_ID: PublicKey;
export declare const PWRC_TOKEN_VERIFIER_PROGRAM_ID: PublicKey;
export declare function findPwrcBridgeConfigPda(mint: PublicKey, programId?: PublicKey): [PublicKey, number];
export declare function findPwrcVaultAuthorityPda(mint: PublicKey, programId?: PublicKey): [PublicKey, number];
export declare function findPwrcLockReceiptPda(config: PublicKey, transferId: Uint8Array, programId?: PublicKey): [PublicKey, number];
export declare function findPwrcReleaseReceiptPda(config: PublicKey, suiBurnReference: Uint8Array, programId?: PublicKey): [PublicKey, number];
//# sourceMappingURL=programs.d.ts.map
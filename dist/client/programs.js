import { PublicKey } from "@solana/web3.js";
import { PWRC_LOCK_LOCALNET_PROGRAM_ID, PWRC_TOKEN_VERIFIER_LOCALNET_PROGRAM_ID, } from "../src/constants.js";
export const PWRC_LOCK_PROGRAM_ID = new PublicKey(PWRC_LOCK_LOCALNET_PROGRAM_ID);
export const PWRC_TOKEN_VERIFIER_PROGRAM_ID = new PublicKey(PWRC_TOKEN_VERIFIER_LOCALNET_PROGRAM_ID);
export function findPwrcBridgeConfigPda(mint, programId = PWRC_LOCK_PROGRAM_ID) {
    return PublicKey.findProgramAddressSync([Buffer.from("bridge-config"), mint.toBuffer()], programId);
}
export function findPwrcVaultAuthorityPda(mint, programId = PWRC_LOCK_PROGRAM_ID) {
    return PublicKey.findProgramAddressSync([Buffer.from("vault-authority"), mint.toBuffer()], programId);
}
export function findPwrcLockReceiptPda(config, transferId, programId = PWRC_LOCK_PROGRAM_ID) {
    if (transferId.length !== 32)
        throw new Error("PWRC_TRANSFER_ID_INVALID_LENGTH");
    return PublicKey.findProgramAddressSync([Buffer.from("lock-receipt"), config.toBuffer(), Buffer.from(transferId)], programId);
}
export function findPwrcReleaseReceiptPda(config, suiBurnReference, programId = PWRC_LOCK_PROGRAM_ID) {
    if (suiBurnReference.length !== 32)
        throw new Error("PWRC_SUI_BURN_REFERENCE_INVALID_LENGTH");
    return PublicKey.findProgramAddressSync([Buffer.from("release-receipt"), config.toBuffer(), Buffer.from(suiBurnReference)], programId);
}
//# sourceMappingURL=programs.js.map
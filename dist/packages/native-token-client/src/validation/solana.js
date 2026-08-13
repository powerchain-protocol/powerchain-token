import bs58 from "bs58";
import { PublicKey } from "@solana/web3.js";
export function assertSolanaAddress(value) {
    const normalized = value.trim();
    let bytes;
    try {
        bytes = bs58.decode(normalized);
    }
    catch {
        throw new Error("SOLANA_ADDRESS_BASE58_INVALID");
    }
    if (bytes.length !== 32) {
        throw new Error("SOLANA_ADDRESS_LENGTH_INVALID");
    }
    return new PublicKey(bytes).toBase58();
}
export function assertSolanaSignature(value) {
    const normalized = value.trim();
    if (!normalized) {
        throw new Error("SOLANA_SIGNATURE_REQUIRED");
    }
    let bytes;
    try {
        bytes = bs58.decode(normalized);
    }
    catch {
        throw new Error("SOLANA_SIGNATURE_BASE58_INVALID");
    }
    if (bytes.length !== 64) {
        throw new Error("SOLANA_SIGNATURE_LENGTH_INVALID");
    }
    return normalized;
}
//# sourceMappingURL=solana.js.map
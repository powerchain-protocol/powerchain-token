import { createHash } from "node:crypto";
import { canonicalJson } from "./canonical-json.js";
export function assertMintAuthorization(auth, now = Date.now()) {
    if (auth.version !== "1.0.0")
        throw new Error("WPWRC_AUTH_VERSION_INVALID");
    if (!/^[a-f0-9]{64}$/i.test(auth.claimHashHex))
        throw new Error("WPWRC_AUTH_HASH_INVALID");
    if (!/^\d+$/.test(auth.solanaSlot))
        throw new Error("WPWRC_AUTH_SLOT_INVALID");
    if (!/^\d+$/.test(auth.amountBaseUnits) || BigInt(auth.amountBaseUnits) <= 0n) {
        throw new Error("WPWRC_AUTH_AMOUNT_INVALID");
    }
    if (!auth.sourceSignature || !auth.canonicalMint || !auth.lockVault) {
        throw new Error("WPWRC_AUTH_SOURCE_IDENTITY_REQUIRED");
    }
    if (!auth.suiRecipient.startsWith("0x"))
        throw new Error("WPWRC_AUTH_RECIPIENT_INVALID");
    if (!auth.verifierId)
        throw new Error("WPWRC_AUTH_VERIFIER_REQUIRED");
    const expiry = Date.parse(auth.expiresAt);
    const observed = Date.parse(auth.observedAt);
    if (!Number.isFinite(expiry) || !Number.isFinite(observed)) {
        throw new Error("WPWRC_AUTH_TIME_INVALID");
    }
    if (expiry <= now)
        throw new Error("WPWRC_AUTH_EXPIRED");
    if (expiry - observed > 10 * 60_000)
        throw new Error("WPWRC_AUTH_TTL_TOO_LONG");
}
export function mintAuthorizationFingerprint(auth) {
    assertMintAuthorization(auth);
    return createHash("sha256")
        .update(canonicalJson(auth))
        .digest("hex");
}
//# sourceMappingURL=sui-bridge-claim.js.map
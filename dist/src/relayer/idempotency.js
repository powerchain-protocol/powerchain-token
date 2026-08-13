import { domainSeparatedSha256 } from "../common/hash.js";
export function buildBridgeIdempotencyKey(input) {
    const sourceReference = input.sourceReference.trim();
    if (!sourceReference)
        throw new Error("PWRC_RELAYER_SOURCE_REFERENCE_REQUIRED");
    return domainSeparatedSha256("POWERCHAIN_RELAYER_IDEMPOTENCY_V1", {
        version: "1.0.0",
        direction: input.direction,
        sourceReference,
    });
}
export async function reserveBridgeOperation(store, record) {
    if (!(await store.reserve(record)))
        throw new Error("PWRC_RELAYER_ALREADY_RESERVED");
}
export async function assertNotFinalized(store, key) {
    const existing = await store.get(key);
    if (existing?.state === "finalized" || existing?.state === "reconciled") {
        throw new Error("PWRC_RELAYER_ALREADY_PROCESSED");
    }
}
//# sourceMappingURL=idempotency.js.map
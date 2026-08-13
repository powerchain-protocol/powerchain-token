import { domainSeparatedSha256 } from "../common/hash.js";
export function buildReplayKey(input) {
    const network = input.network.trim().toLowerCase();
    const reference = input.reference.trim();
    if (!network)
        throw new Error("POWERCHAIN_REPLAY_NETWORK_REQUIRED");
    if (!reference)
        throw new Error("POWERCHAIN_REPLAY_REFERENCE_REQUIRED");
    return domainSeparatedSha256("POWERCHAIN_REPLAY_V1", {
        version: "1.0.0",
        domain: input.domain,
        network,
        reference,
    });
}
export async function reserveReplayKey(store, key) {
    if (!/^[a-f0-9]{64}$/i.test(key))
        throw new Error("POWERCHAIN_REPLAY_KEY_INVALID");
    if (!(await store.reserve(key)))
        throw new Error("POWERCHAIN_REPLAY_DETECTED");
}
export async function assertReplayUnused(store, key) {
    if (await store.has(key))
        throw new Error("POWERCHAIN_REPLAY_DETECTED");
}
//# sourceMappingURL=replay.js.map
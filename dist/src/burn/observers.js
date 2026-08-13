export function assertSolanaSupplyObserverConsensus(input) {
    const minObservers = input.minObservers ?? 2;
    const maxSlotDistance = input.maxSlotDistance ?? 32n;
    const maxAgeMs = input.maxAgeMs ?? 60_000;
    const nowMs = input.nowMs ?? Date.now();
    if (input.observations.length < minObservers) {
        throw new Error("PWRC_BURN_INSUFFICIENT_SOLANA_OBSERVERS");
    }
    const uniqueObservers = new Set(input.observations.map((x) => x.observerId));
    const uniqueRpcs = new Set(input.observations.map((x) => x.rpcUrl));
    if (uniqueObservers.size < minObservers) {
        throw new Error("PWRC_BURN_OBSERVER_ID_NOT_INDEPENDENT");
    }
    if (uniqueRpcs.size < minObservers) {
        throw new Error("PWRC_BURN_RPC_NOT_INDEPENDENT");
    }
    const expectedSupply = input.observations[0].supplyBaseUnits;
    let minSlot = input.observations[0].slot;
    let maxSlot = input.observations[0].slot;
    for (const observation of input.observations) {
        if (observation.supplyBaseUnits !== expectedSupply) {
            throw new Error("PWRC_BURN_SOLANA_SUPPLY_OBSERVER_DISAGREEMENT");
        }
        const observedMs = Date.parse(observation.observedAt);
        if (!Number.isFinite(observedMs) || nowMs - observedMs > maxAgeMs) {
            throw new Error("PWRC_BURN_SOLANA_OBSERVATION_STALE");
        }
        if (observation.slot < minSlot)
            minSlot = observation.slot;
        if (observation.slot > maxSlot)
            maxSlot = observation.slot;
    }
    if (maxSlot - minSlot > maxSlotDistance) {
        throw new Error("PWRC_BURN_SOLANA_OBSERVER_SLOT_DIVERGENCE");
    }
    return {
        supplyBaseUnits: expectedSupply,
        minSlot,
        maxSlot,
    };
}
//# sourceMappingURL=observers.js.map
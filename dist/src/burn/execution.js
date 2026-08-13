export function assertExactBurnExecution(input) {
    if (input.plannedBurnBaseUnits <= 0n) {
        throw new Error("PWRC_PLANNED_BURN_INVALID");
    }
    if (input.observedBurnedBaseUnits !== input.plannedBurnBaseUnits) {
        throw new Error("PWRC_PARTIAL_OR_EXCESS_BURN_FORBIDDEN");
    }
    const expectedPost = input.preBurnSupplyBaseUnits - input.plannedBurnBaseUnits;
    if (input.postBurnSupplyBaseUnits !== expectedPost) {
        throw new Error("PWRC_POST_BURN_SUPPLY_MISMATCH");
    }
}
//# sourceMappingURL=execution.js.map
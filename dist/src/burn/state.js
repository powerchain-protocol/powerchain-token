const ALLOWED = {
    PLANNED: ["PRECHECKED", "BLOCKED"],
    PRECHECKED: [
        "SUI_BRIDGE_PAUSE_SUBMITTED",
        "BLOCKED",
    ],
    SUI_BRIDGE_PAUSE_SUBMITTED: [
        "SUI_BRIDGE_PAUSED",
        "BLOCKED",
    ],
    SUI_BRIDGE_PAUSED: [
        "SUI_BURN_INTENT_SUBMITTED",
        "BLOCKED",
    ],
    SUI_BURN_INTENT_SUBMITTED: [
        "SUI_BURN_INTENT_FINALIZED",
        "BLOCKED",
    ],
    SUI_BURN_INTENT_FINALIZED: [
        "SOLANA_SIMULATED",
        "BLOCKED",
    ],
    SOLANA_SIMULATED: [
        "SOLANA_SUBMITTED",
        "BLOCKED",
    ],
    SOLANA_SUBMITTED: [
        "SOLANA_FINALIZED",
        "BLOCKED",
    ],
    SOLANA_FINALIZED: [
        "SUI_CEILING_SUBMITTED",
        "BLOCKED",
    ],
    SUI_CEILING_SUBMITTED: [
        "SUI_CEILING_FINALIZED",
        "BLOCKED",
    ],
    SUI_CEILING_FINALIZED: [
        "RECONCILED",
        "BLOCKED",
    ],
    RECONCILED: [
        "COMPLETED",
        "BLOCKED",
    ],
    COMPLETED: [],
    BLOCKED: [],
};
export function assertQuarterlyBurnTransition(from, to) {
    if (!ALLOWED[from].includes(to)) {
        throw new Error(`PWRC_BURN_INVALID_TRANSITION:${from}->${to}`);
    }
}
//# sourceMappingURL=state.js.map
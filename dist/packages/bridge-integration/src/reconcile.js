export function bridgeExposureBaseUnits(input) {
    const values = Object.values(input);
    if (values.some((value) => value < 0n)) {
        throw new Error("PWRC_INTEGRATION_NEGATIVE_BALANCE");
    }
    return (input.circulatingWpwrcBaseUnits +
        input.pendingSolanaToSuiBaseUnits +
        input.pendingSuiToSolanaBaseUnits);
}
export function assertBridgeConservation(input) {
    const exposure = bridgeExposureBaseUnits(input);
    if (exposure !== input.lockedPwrcBaseUnits) {
        throw new Error("PWRC_INTEGRATION_CONSERVATION_MISMATCH");
    }
}
//# sourceMappingURL=reconcile.js.map
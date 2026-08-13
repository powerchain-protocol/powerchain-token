export const CCTP_VERSION = "v2";
export const CCTP_ASSET = "USDC";
export const PWRC_CCTP_POLICY = {
    version: "v2",
    asset: "USDC",
    allowPwrc: false,
    requireCircleAttestation: true,
    requireFinalizedSourceObservation: true,
    requireDestinationReceiptVerification: true,
};
export function assertCctpIntent(intent) {
    if (intent.sourceDomain === intent.destinationDomain)
        throw new Error("CCTP_SAME_DOMAIN");
    if (intent.sourceDomain < 0 || intent.destinationDomain < 0)
        throw new Error("CCTP_DOMAIN_INVALID");
    if (intent.amountUsdcBaseUnits <= 0n)
        throw new Error("CCTP_AMOUNT_INVALID");
    if (!intent.recipient)
        throw new Error("CCTP_RECIPIENT_REQUIRED");
}
//# sourceMappingURL=policy.js.map
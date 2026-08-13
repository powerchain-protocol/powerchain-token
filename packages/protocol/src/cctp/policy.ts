export const CCTP_VERSION = "v2" as const;
export const CCTP_ASSET = "USDC" as const;

export interface CctpTransferIntent {
  sourceDomain: number;
  destinationDomain: number;
  amountUsdcBaseUnits: bigint;
  recipient: string;
  nonce?: string;
}

export interface CctpPolicy {
  version: "v2";
  asset: "USDC";
  allowPwrc: false;
  requireCircleAttestation: true;
  requireFinalizedSourceObservation: true;
  requireDestinationReceiptVerification: true;
}

export const PWRC_CCTP_POLICY: CctpPolicy = {
  version: "v2",
  asset: "USDC",
  allowPwrc: false,
  requireCircleAttestation: true,
  requireFinalizedSourceObservation: true,
  requireDestinationReceiptVerification: true,
};

export function assertCctpIntent(intent: CctpTransferIntent): void {
  if (intent.sourceDomain === intent.destinationDomain) throw new Error("CCTP_SAME_DOMAIN");
  if (intent.sourceDomain < 0 || intent.destinationDomain < 0) throw new Error("CCTP_DOMAIN_INVALID");
  if (intent.amountUsdcBaseUnits <= 0n) throw new Error("CCTP_AMOUNT_INVALID");
  if (!intent.recipient) throw new Error("CCTP_RECIPIENT_REQUIRED");
}

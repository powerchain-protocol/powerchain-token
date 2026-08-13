export interface SignedMessageEnvelope {
    version: "1.0.0";
    signer: string;
    messageBase64: string;
    signatureBase58: string;
}
export declare function verifySolanaSignedMessage(envelope: SignedMessageEnvelope): boolean;
//# sourceMappingURL=signed-message.d.ts.map
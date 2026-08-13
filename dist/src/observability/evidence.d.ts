export interface EvidenceEnvelope<T> {
    version: "1.0.0";
    type: string;
    observedAt: number;
    subject: string;
    payload: T;
    previousSha256?: string;
    sha256: string;
}
export declare function createEvidenceEnvelope<T>(input: {
    type: string;
    observedAt: number;
    subject: string;
    payload: T;
    previousSha256?: string;
}): EvidenceEnvelope<T>;
export declare function verifyEvidenceEnvelope<T>(evidence: EvidenceEnvelope<T>): void;
//# sourceMappingURL=evidence.d.ts.map
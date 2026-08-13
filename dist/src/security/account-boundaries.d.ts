export interface WritableBoundary {
    address: string;
    writable: boolean;
    signer: boolean;
    role: "authority" | "source" | "destination" | "vault" | "state" | "receipt";
}
export declare function assertMutableBoundary(accounts: readonly WritableBoundary[]): void;
//# sourceMappingURL=account-boundaries.d.ts.map
export interface ValidationResult {
    ok: boolean;
    errors: string[];
}
export declare function invariant(condition: unknown, code: string): asserts condition;
export declare function assertPositiveBigInt(value: bigint, code?: string): void;
export declare function assertNonEmptyString(value: string, code?: string): string;
export declare function assertExactBytes(value: Uint8Array, length: number, code?: string): Uint8Array;
//# sourceMappingURL=common.d.ts.map
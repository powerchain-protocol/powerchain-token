export declare function readPositiveInteger(value: string | undefined, fallback: number, options?: {
    min?: number;
    max?: number;
}): number;
export declare function readBoolean(value: string | undefined, fallback: boolean): boolean;
export declare function readEnum<const T extends readonly string[]>(value: string | undefined, allowed: T, fallback: T[number]): T[number];
export declare function readOptionalString(value: string | undefined): string | undefined;
//# sourceMappingURL=config.d.ts.map
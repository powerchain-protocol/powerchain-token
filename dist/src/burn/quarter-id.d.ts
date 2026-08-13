import type { Quarter } from "./schedule.js";
export declare const PWRC_BURN_START_YEAR: 2027;
export declare const PWRC_BURN_START_QUARTER: 1;
export declare const PWRC_BURN_START_QUARTER_ID: 20271n;
/**
 * Canonical quarter ID encoding:
 * YYYYQ, e.g. 2027 Q1 => 20271.
 */
export declare function encodeQuarterId(year: number, quarter: Quarter): bigint;
export declare function decodeQuarterId(id: bigint): {
    year: number;
    quarter: Quarter;
};
export declare function assertQuarterAtOrAfterBurnStart(id: bigint): void;
export declare function nextQuarterId(id: bigint): bigint;
export declare function burnSequenceForQuarter(id: bigint): bigint;
export declare function assertContiguousQuarter(previousQuarterId: bigint | null, currentQuarterId: bigint): void;
//# sourceMappingURL=quarter-id.d.ts.map
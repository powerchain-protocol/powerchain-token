import type { Quarter } from "./schedule.js";
export interface QuarterlyExecutionWindow {
    year: number;
    quarter: Quarter;
    startsAt: string;
    endsAt: string;
}
/**
 * Burn is executed after the quarter has closed, inside a bounded grace window.
 * Example: Q3 2026 closes 2026-10-01T00:00:00Z. With 14 grace days, the
 * execution window is [2026-10-01, 2026-10-15).
 */
export declare function quarterlyExecutionWindow(input: {
    year: number;
    quarter: Quarter;
    graceDays?: number;
}): QuarterlyExecutionWindow;
export declare function assertWithinQuarterlyExecutionWindow(input: {
    now: Date;
    year: number;
    quarter: Quarter;
    graceDays?: number;
}): void;
//# sourceMappingURL=window.d.ts.map
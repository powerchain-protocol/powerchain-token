export type Quarter = 1 | 2 | 3 | 4;
export interface QuarterWindow {
    year: number;
    quarter: Quarter;
    startsAt: string;
    endsAt: string;
    burnId: string;
}
export declare function quarterWindow(date: Date): QuarterWindow;
export declare function assertQuarterNotAlreadyExecuted(burnId: string, executedBurnIds: ReadonlySet<string>): void;
//# sourceMappingURL=schedule.d.ts.map
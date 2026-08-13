export interface BurnCalendarEntry {
    quarterId: string;
    sequence: string;
    label: string;
    quarterStartsAt: string;
    quarterEndsAt: string;
    executionWindowStartsAt: string;
    executionWindowEndsAt: string;
}
export declare function buildBurnCalendar(count: number, graceDays?: number): BurnCalendarEntry[];
//# sourceMappingURL=calendar.d.ts.map
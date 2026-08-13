import { PWRC_BURN_START_QUARTER_ID, burnSequenceForQuarter, decodeQuarterId, nextQuarterId, } from "./quarter-id.js";
export function buildBurnCalendar(count, graceDays = 14) {
    if (!Number.isInteger(count) || count < 1 || count > 100) {
        throw new Error("PWRC_BURN_CALENDAR_COUNT_INVALID");
    }
    const result = [];
    let id = PWRC_BURN_START_QUARTER_ID;
    for (let i = 0; i < count; i += 1) {
        const { year, quarter } = decodeQuarterId(id);
        const startMonth = (quarter - 1) * 3;
        const quarterStart = new Date(Date.UTC(year, startMonth, 1));
        const quarterEnd = new Date(Date.UTC(year, startMonth + 3, 1));
        const executionEnd = new Date(quarterEnd.getTime() + graceDays * 86_400_000);
        result.push({
            quarterId: id.toString(),
            sequence: burnSequenceForQuarter(id).toString(),
            label: `${year} Q${quarter}`,
            quarterStartsAt: quarterStart.toISOString(),
            quarterEndsAt: quarterEnd.toISOString(),
            executionWindowStartsAt: quarterEnd.toISOString(),
            executionWindowEndsAt: executionEnd.toISOString(),
        });
        id = nextQuarterId(id);
    }
    return result;
}
//# sourceMappingURL=calendar.js.map
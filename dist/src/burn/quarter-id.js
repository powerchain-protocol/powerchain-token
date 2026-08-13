export const PWRC_BURN_START_YEAR = 2027;
export const PWRC_BURN_START_QUARTER = 1;
export const PWRC_BURN_START_QUARTER_ID = 20271n;
/**
 * Canonical quarter ID encoding:
 * YYYYQ, e.g. 2027 Q1 => 20271.
 */
export function encodeQuarterId(year, quarter) {
    if (!Number.isInteger(year) || year < 2000 || year > 9999) {
        throw new Error("PWRC_BURN_YEAR_INVALID");
    }
    if (![1, 2, 3, 4].includes(quarter)) {
        throw new Error("PWRC_BURN_QUARTER_INVALID");
    }
    return BigInt(year * 10 + quarter);
}
export function decodeQuarterId(id) {
    if (id <= 0n || id > 99999n) {
        throw new Error("PWRC_BURN_QUARTER_ID_INVALID");
    }
    const raw = Number(id);
    const quarter = (raw % 10);
    const year = Math.floor(raw / 10);
    if (![1, 2, 3, 4].includes(quarter) || year < 2000) {
        throw new Error("PWRC_BURN_QUARTER_ID_INVALID");
    }
    return { year, quarter };
}
export function assertQuarterAtOrAfterBurnStart(id) {
    const current = decodeQuarterId(id);
    const start = {
        year: PWRC_BURN_START_YEAR,
        quarter: PWRC_BURN_START_QUARTER,
    };
    if (current.year < start.year ||
        (current.year === start.year && current.quarter < start.quarter)) {
        throw new Error("PWRC_BURN_BEFORE_POLICY_START");
    }
}
export function nextQuarterId(id) {
    const { year, quarter } = decodeQuarterId(id);
    if (quarter === 4)
        return encodeQuarterId(year + 1, 1);
    return encodeQuarterId(year, (quarter + 1));
}
export function burnSequenceForQuarter(id) {
    assertQuarterAtOrAfterBurnStart(id);
    const { year, quarter } = decodeQuarterId(id);
    const elapsedQuarters = BigInt((year - PWRC_BURN_START_YEAR) * 4) +
        BigInt(quarter - PWRC_BURN_START_QUARTER);
    return elapsedQuarters + 1n;
}
export function assertContiguousQuarter(previousQuarterId, currentQuarterId) {
    assertQuarterAtOrAfterBurnStart(currentQuarterId);
    if (previousQuarterId === null || previousQuarterId === 0n) {
        if (currentQuarterId !== PWRC_BURN_START_QUARTER_ID) {
            throw new Error("PWRC_FIRST_BURN_MUST_BE_2027_Q1");
        }
        return;
    }
    const expected = nextQuarterId(previousQuarterId);
    if (currentQuarterId !== expected) {
        throw new Error("PWRC_BURN_QUARTER_NOT_CONTIGUOUS");
    }
}
//# sourceMappingURL=quarter-id.js.map
import { sha256CanonicalJson } from "../common/serialization.js";
export function assertQuarterlyBurnExecutionRecord(record) {
    if (record.version !== "1.0.0") {
        throw new Error("PWRC_BURN_RECORD_VERSION_INVALID");
    }
    if (!/^[0-9]{5}$/.test(record.quarterId)) {
        throw new Error("PWRC_BURN_RECORD_QUARTER_INVALID");
    }
    if (BigInt(record.quarterId) < 20271n) {
        throw new Error("PWRC_BURN_RECORD_BEFORE_POLICY_START");
    }
    for (const value of [record.planSha256, record.intentSha256]) {
        if (!/^[a-f0-9]{64}$/i.test(value)) {
            throw new Error("PWRC_BURN_RECORD_HASH_INVALID");
        }
    }
    const pre = BigInt(record.preBurnCanonicalSupplyBaseUnits);
    const burn = BigInt(record.targetBurnCanonicalBaseUnits);
    const post = BigInt(record.expectedPostBurnCanonicalSupplyBaseUnits);
    const wrapped = BigInt(record.expectedPostBurnWrappedCeilingBaseUnits);
    if (pre <= 0n || burn <= 0n || post < 0n || wrapped < 0n) {
        throw new Error("PWRC_BURN_RECORD_AMOUNT_INVALID");
    }
    if (post !== pre - burn) {
        throw new Error("PWRC_BURN_RECORD_POST_SUPPLY_MISMATCH");
    }
    if (wrapped !== post) {
        throw new Error("PWRC_BURN_RECORD_WRAPPED_CEILING_MISMATCH");
    }
}
export function quarterlyBurnExecutionRecordSha256(record) {
    assertQuarterlyBurnExecutionRecord(record);
    return sha256CanonicalJson(record);
}
//# sourceMappingURL=record.js.map
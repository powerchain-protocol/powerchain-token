import { createHash } from "node:crypto";
import { canonicalJsonStringify } from "../common/serialization.js";
export function assertQuarterlyBurnIntent(intent) {
    if (intent.version !== "1.0.0") {
        throw new Error("PWRC_BURN_INTENT_VERSION_INVALID");
    }
    if (!/^[0-9]{5}$/.test(intent.quarterId)) {
        throw new Error("PWRC_BURN_INTENT_QUARTER_INVALID");
    }
    if (BigInt(intent.quarterId) < 20271n) {
        throw new Error("PWRC_BURN_INTENT_BEFORE_POLICY_START");
    }
    const pre = BigInt(intent.preBurnCanonicalSupplyBaseUnits);
    const target = BigInt(intent.targetBurnCanonicalBaseUnits);
    const post = BigInt(intent.expectedPostBurnCanonicalSupplyBaseUnits);
    const wrappedCeiling = BigInt(intent.expectedPostBurnWrappedCeilingBaseUnits);
    if (pre <= 0n || target <= 0n) {
        throw new Error("PWRC_BURN_INTENT_AMOUNT_INVALID");
    }
    if (post !== pre - target) {
        throw new Error("PWRC_BURN_INTENT_POST_SUPPLY_MISMATCH");
    }
    const expectedWrappedCeiling = post;
    if (wrappedCeiling !== expectedWrappedCeiling) {
        throw new Error("PWRC_BURN_INTENT_WRAPPED_CEILING_MISMATCH");
    }
    if (!/^[a-f0-9]{64}$/i.test(intent.planSha256)) {
        throw new Error("PWRC_BURN_INTENT_PLAN_HASH_INVALID");
    }
}
export function quarterlyBurnIntentSha256(intent) {
    assertQuarterlyBurnIntent(intent);
    return createHash("sha256")
        .update("POWERCHAIN_QUARTERLY_BURN_INTENT_V1\0")
        .update(canonicalJsonStringify(intent))
        .digest("hex");
}
//# sourceMappingURL=intent.js.map
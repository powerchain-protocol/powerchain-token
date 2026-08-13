import { createHash } from "node:crypto";
import { canonicalJson } from "../canonical-json.js";
import { assertBurnSourceCanFundTarget, assertQuarterlyBurnCrossChainSafe, quoteQuarterlyBurnFromLiveSupply, } from "./policy.js";
export function buildQuarterlyBurnPlan(input) {
    const quote = quoteQuarterlyBurnFromLiveSupply(input.currentCanonicalSupplyBaseUnits);
    assertBurnSourceCanFundTarget({
        targetBurnBaseUnits: quote.targetBurnBaseUnits,
        controlledSourceBalanceBaseUnits: input.controlledSourceBalanceBaseUnits,
    });
    assertQuarterlyBurnCrossChainSafe({
        postBurnCanonicalSupplyBaseUnits: quote.postBurnCanonicalSupplyBaseUnits,
        solanaLockedBaseUnits: input.solanaLockedBaseUnits,
        suiWrappedSupplyBaseUnits: input.suiWrappedSupplyBaseUnits,
        pendingSolanaToSuiBaseUnits: input.pendingSolanaToSuiBaseUnits,
        pendingSuiToSolanaBaseUnits: input.pendingSuiToSolanaBaseUnits,
    });
    const body = {
        version: "1.0.0",
        burnId: input.burnId,
        quarterId: input.quarterId.toString(),
        canonicalMint: input.canonicalMint,
        controlledSourceTokenAccount: input.controlledSourceTokenAccount,
        burnAuthority: input.burnAuthority,
        targetBurnBaseUnits: quote.targetBurnBaseUnits.toString(),
        preBurnCanonicalSupplyBaseUnits: quote.currentCanonicalSupplyBaseUnits.toString(),
        postBurnCanonicalSupplyBaseUnits: quote.postBurnCanonicalSupplyBaseUnits.toString(),
        solanaLockedBaseUnits: input.solanaLockedBaseUnits.toString(),
        suiWrappedSupplyBaseUnits: input.suiWrappedSupplyBaseUnits.toString(),
        pendingSolanaToSuiBaseUnits: input.pendingSolanaToSuiBaseUnits.toString(),
        pendingSuiToSolanaBaseUnits: input.pendingSuiToSolanaBaseUnits.toString(),
        solanaSlot: input.solanaSlot.toString(),
        suiCheckpoint: input.suiCheckpoint.toString(),
    };
    return {
        ...body,
        sha256: createHash("sha256")
            .update(canonicalJson(body))
            .digest("hex"),
    };
}
//# sourceMappingURL=plan.js.map
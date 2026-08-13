import { createHash } from "node:crypto";
import { canonicalJson } from "../canonical-json.js";
import { assertNonZeroPwrcAmount } from "./policy.js";
import { assertSlippageBps } from "./risk.js";
export function buildQuoteId(quote) {
    return createHash("sha256").update(canonicalJson(quote)).digest("hex");
}
export function assertPwrcTradeQuote(quote, now = Math.floor(Date.now() / 1000)) {
    if (quote.version !== "1.0.0")
        throw new Error("PWRC_QUOTE_VERSION_INVALID");
    if (!/^[a-f0-9]{64}$/i.test(quote.quoteId))
        throw new Error("PWRC_QUOTE_ID_INVALID");
    const input = BigInt(quote.inputAmountBaseUnits);
    const minOutput = BigInt(quote.minimumOutputBaseUnits);
    assertNonZeroPwrcAmount(input, "QUOTE_INPUT");
    if (minOutput <= 0n)
        throw new Error("PWRC_ZERO_OR_NEGATIVE_QUOTE_OUTPUT");
    assertSlippageBps(quote.slippageBps);
    if (quote.expiresAt <= now)
        throw new Error("PWRC_QUOTE_EXPIRED");
    if (quote.expiresAt - quote.issuedAt > 120)
        throw new Error("PWRC_QUOTE_TTL_TOO_LONG");
    const { quoteId, ...unsigned } = quote;
    if (buildQuoteId(unsigned) !== quoteId)
        throw new Error("PWRC_QUOTE_FINGERPRINT_MISMATCH");
}
//# sourceMappingURL=quote.js.map
import { TOKEN_2022_PROGRAM_ID, createTransferCheckedWithFeeInstruction, } from "@solana/spl-token";
import { PWRC_DECIMALS, } from "../constants.js";
import { assertPwrcBaseUnits, } from "../amounts.js";
import { calculateTransferFeeBaseUnits, } from "../fees.js";
export function createPwrcTransferInstruction(input) {
    const amount = assertPwrcBaseUnits(input.amountBaseUnits);
    if (amount <= 0n) {
        throw new Error("PWRC_TRANSFER_AMOUNT_MUST_BE_POSITIVE");
    }
    const expectedFee = calculateTransferFeeBaseUnits(amount);
    return createTransferCheckedWithFeeInstruction(input.source, input.mint, input.destination, input.authority, amount, PWRC_DECIMALS, expectedFee, input.multiSigners ?? [], TOKEN_2022_PROGRAM_ID);
}
//# sourceMappingURL=transfer.js.map
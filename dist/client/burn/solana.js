import { PublicKey, Transaction, } from "@solana/web3.js";
import { createBurnCheckedInstruction, getAccount, TOKEN_2022_PROGRAM_ID, } from "@solana/spl-token";
export async function buildCanonicalPwrcBurnTransaction(input) {
    if (input.burnBaseUnits <= 0n) {
        throw new Error("PWRC_BURN_AMOUNT_MUST_BE_POSITIVE");
    }
    const source = await getAccount(input.connection, input.sourceTokenAccount, "confirmed", TOKEN_2022_PROGRAM_ID);
    if (!source.mint.equals(input.mint)) {
        throw new Error("PWRC_BURN_SOURCE_MINT_MISMATCH");
    }
    if (!source.owner.equals(input.burnAuthority)) {
        throw new Error("PWRC_BURN_SOURCE_AUTHORITY_MISMATCH");
    }
    if (source.amount < input.burnBaseUnits) {
        throw new Error("PWRC_BURN_SOURCE_INSUFFICIENT");
    }
    return new Transaction().add(createBurnCheckedInstruction(input.sourceTokenAccount, input.mint, input.burnAuthority, input.burnBaseUnits, 9, [], TOKEN_2022_PROGRAM_ID));
}
//# sourceMappingURL=solana.js.map
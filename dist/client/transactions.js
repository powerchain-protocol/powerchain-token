import { Connection, Keypair, PublicKey, Transaction, } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID, createTransferCheckedWithFeeInstruction, getAccount, } from "@solana/spl-token";
import { PWRC_CANONICAL_MINT, PWRC_DECIMALS, PWRC_FINALITY, } from "../src/constants.js";
import { quoteToken2022TransferFee } from "../src/fees.js";
export async function validatePwrcTransferAccounts(input) {
    if (input.source.equals(input.destination)) {
        throw new Error("PWRC_SOURCE_DESTINATION_MUST_DIFFER");
    }
    if (input.mint.toBase58() !== PWRC_CANONICAL_MINT) {
        throw new Error("PWRC_CANONICAL_MINT_ADDRESS_MISMATCH");
    }
    const [source, destination] = await Promise.all([
        getAccount(input.connection, input.source, PWRC_FINALITY, TOKEN_2022_PROGRAM_ID),
        getAccount(input.connection, input.destination, PWRC_FINALITY, TOKEN_2022_PROGRAM_ID),
    ]);
    if (!source.mint.equals(input.mint) || !destination.mint.equals(input.mint)) {
        throw new Error("PWRC_TOKEN_ACCOUNT_MINT_MISMATCH");
    }
    if (!source.owner.equals(input.owner))
        throw new Error("PWRC_SOURCE_OWNER_MISMATCH");
    if (source.amount < input.amountBaseUnits)
        throw new Error("PWRC_INSUFFICIENT_SOURCE_BALANCE");
}
export async function sendPwrcTransfer(input) {
    const commitment = input.commitment ?? PWRC_FINALITY;
    if (commitment !== "finalized") {
        throw new Error("PWRC_PRODUCTION_COMMITMENT_MUST_BE_FINALIZED");
    }
    const owner = input.signer.publicKey;
    const quote = quoteToken2022TransferFee(input.amountBaseUnits);
    await validatePwrcTransferAccounts({
        connection: input.connection,
        owner,
        mint: input.mint,
        source: input.source,
        destination: input.destination,
        amountBaseUnits: input.amountBaseUnits,
    });
    const instruction = createTransferCheckedWithFeeInstruction(input.source, input.mint, input.destination, owner, input.amountBaseUnits, PWRC_DECIMALS, quote.feeBaseUnits, [], TOKEN_2022_PROGRAM_ID);
    const latest = await input.connection.getLatestBlockhash("finalized");
    const transaction = new Transaction({
        feePayer: owner,
        recentBlockhash: latest.blockhash,
    }).add(instruction);
    transaction.sign(input.signer);
    if (input.simulate ?? true) {
        const simulation = await input.connection.simulateTransaction(transaction);
        if (simulation.value.err) {
            throw new Error(`PWRC_TRANSACTION_SIMULATION_FAILED:${JSON.stringify(simulation.value.err)}`);
        }
    }
    // Intentionally no blind retry: an ambiguous send must be reconciled by signature.
    const signature = await input.connection.sendRawTransaction(transaction.serialize(), {
        skipPreflight: false,
        preflightCommitment: "confirmed",
        maxRetries: 0,
    });
    const confirmation = await input.connection.confirmTransaction({ signature, blockhash: latest.blockhash, lastValidBlockHeight: latest.lastValidBlockHeight }, "finalized");
    if (confirmation.value.err) {
        throw new Error(`PWRC_TRANSACTION_FAILED:${signature}`);
    }
    return {
        signature,
        quote,
        blockhash: latest.blockhash,
        lastValidBlockHeight: latest.lastValidBlockHeight,
    };
}
export async function reconcilePwrcTransferSignature(connection, signature) {
    const result = await connection.getSignatureStatuses([signature], {
        searchTransactionHistory: true,
    });
    const status = result.value[0];
    if (!status)
        return "unknown";
    if (status.err)
        return "failed";
    return status.confirmationStatus === "finalized" ? "finalized" : "unknown";
}
/** @deprecated Canonical PWRC fees are native Token-2022 fees. */
export const sendPwrcProtocolTransfer = sendPwrcTransfer;
//# sourceMappingURL=transactions.js.map
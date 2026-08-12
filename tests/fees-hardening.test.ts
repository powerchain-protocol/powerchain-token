import test from "node:test";
import assert from "node:assert/strict";
import { PublicKey } from "@solana/web3.js";
import { TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import {
  buildPwrcFeeTransferInstruction,
  derivePwrcFeeVault,
  PWRC_FEE_COLLECTOR,
} from "../client/programs.js";
import {
  derivePwrcTransferId,
  PWRC_TRANSFER_REFERENCE_MAX_BYTES,
} from "../src/fees.js";

const mint = new PublicKey("So11111111111111111111111111111111111111112");
const source = new PublicKey("11111111111111111111111111111111");
const destination = new PublicKey("SysvarRent111111111111111111111111111111111");
const owner = PWRC_FEE_COLLECTOR;

test("fee vault derives deterministically for Token-2022", () => {
  assert.ok(derivePwrcFeeVault(mint) instanceof PublicKey);
  assert.equal(derivePwrcFeeVault(mint).toBase58(), derivePwrcFeeVault(mint).toBase58());
});

test("instruction builder rejects source equal to destination", () => {
  const feeVault = derivePwrcFeeVault(mint);
  assert.throws(
    () =>
      buildPwrcFeeTransferInstruction({
        owner,
        source,
        destination: source,
        feeVault,
        mint,
        tokenProgram: TOKEN_2022_PROGRAM_ID,
        grossAmountBaseUnits: 1_000_000_000n,
        transferReference: "test:source-equals-destination",
      }),
    /PWRC_SOURCE_DESTINATION_MUST_DIFFER/,
  );
});

test("transfer references have a bounded UTF-8 length", () => {
  assert.equal(PWRC_TRANSFER_REFERENCE_MAX_BYTES, 256);
  assert.throws(
    () => derivePwrcTransferId("x".repeat(257)),
    /PWRC_TRANSFER_REFERENCE_TOO_LONG/,
  );
});

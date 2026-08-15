import test from "node:test";
import assert from "node:assert/strict";
import {
  verifyPwrcMetaplexCompatibility,
} from "../packages/metaplex/src/compatibility.js";
import {
  METAPLEX_TOKEN_METADATA_PROGRAM_ID,
  PWRC_CANONICAL_MINT,
  PWRC_METADATA_IMAGE_URI,
  PWRC_METADATA_URI,
  SOLANA_TOKEN_2022_PROGRAM_ID,
} from "../packages/protocol/src/constants.js";

test(
  "canonical PWRC is Metaplex fungible + Token-2022 compatible",
  () => {
    const result =
      verifyPwrcMetaplexCompatibility({
        mint:
          PWRC_CANONICAL_MINT,
        tokenMetadataProgramId:
          METAPLEX_TOKEN_METADATA_PROGRAM_ID,
        splTokenProgramId:
          SOLANA_TOKEN_2022_PROGRAM_ID,
        name:
          "PowerChain",
        symbol:
          "PWRC",
        uri:
          PWRC_METADATA_URI,
        image:
          PWRC_METADATA_IMAGE_URI,
        tokenStandard:
          "Fungible",
      });

    assert.equal(
      result.compatible,
      true,
    );
    assert.equal(
      result.token2022,
      true,
    );
  },
);

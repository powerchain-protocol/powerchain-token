import {
  METAPLEX_TOKEN_METADATA_PROGRAM_ID,
  PWRC_CANONICAL_MINT,
  PWRC_METADATA_IMAGE_URI,
  PWRC_METADATA_URI,
  PWRC_NAME,
  PWRC_SYMBOL,
  SOLANA_TOKEN_2022_PROGRAM_ID,
} from "@powerchain/protocol/constants";

export interface PwrcMetaplexCompatibilityInput {
  mint:
    string;
  tokenMetadataProgramId:
    string;
  splTokenProgramId:
    string;
  name:
    string;
  symbol:
    string;
  uri:
    string;
  image:
    string;
  tokenStandard?:
    string |
    null;
}

export interface PwrcMetaplexCompatibilityResult {
  version:
    "1.0.0";
  compatible:
    boolean;
  tokenStandard:
    "Fungible";
  token2022:
    true;
  failures:
    readonly string[];
}

export function verifyPwrcMetaplexCompatibility(
  input:
    PwrcMetaplexCompatibilityInput,
): PwrcMetaplexCompatibilityResult {
  const failures:
    string[] =
    [];

  if (
    input.mint !==
      PWRC_CANONICAL_MINT
  ) {
    failures.push(
      "PWRC_METAPLEX_MINT_MISMATCH",
    );
  }

  if (
    input.tokenMetadataProgramId !==
      METAPLEX_TOKEN_METADATA_PROGRAM_ID
  ) {
    failures.push(
      "PWRC_METAPLEX_PROGRAM_MISMATCH",
    );
  }

  if (
    input.splTokenProgramId !==
      SOLANA_TOKEN_2022_PROGRAM_ID
  ) {
    failures.push(
      "PWRC_METAPLEX_TOKEN2022_PROGRAM_MISMATCH",
    );
  }

  if (
    input.name !==
      PWRC_NAME
  ) {
    failures.push(
      "PWRC_METAPLEX_NAME_MISMATCH",
    );
  }

  if (
    input.symbol !==
      PWRC_SYMBOL
  ) {
    failures.push(
      "PWRC_METAPLEX_SYMBOL_MISMATCH",
    );
  }

  if (
    input.uri !==
      PWRC_METADATA_URI
  ) {
    failures.push(
      "PWRC_METAPLEX_URI_MISMATCH",
    );
  }

  if (
    input.image !==
      PWRC_METADATA_IMAGE_URI
  ) {
    failures.push(
      "PWRC_METAPLEX_IMAGE_MISMATCH",
    );
  }

  if (
    input.tokenStandard &&
    input.tokenStandard !==
      "Fungible"
  ) {
    failures.push(
      "PWRC_METAPLEX_TOKEN_STANDARD_MISMATCH",
    );
  }

  return {
    version:
      "1.0.0",
    compatible:
      failures.length ===
      0,
    tokenStandard:
      "Fungible",
    token2022:
      true,
    failures,
  };
}

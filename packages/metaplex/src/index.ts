import {
  fetchMetadata,
  findMetadataPda,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  publicKey,
  type PublicKey,
  type Umi,
} from "@metaplex-foundation/umi";
import {
  createUmi,
} from "@metaplex-foundation/umi-bundle-defaults";
import {
  PWRC_METADATA,
} from "@powerchain/protocol/metadata";

export interface PowerChainMetadataIdentity {
  mint: string;
  tokenMetadataProgramId: string;
  metadataPda: string;
  uri: string;
  image: string;
}

export function createPowerChainUmi(
  rpcUrl: string,
): Umi {
  if (
    !rpcUrl ||
    !/^https?:\/\//.test(
      rpcUrl,
    )
  ) {
    throw new Error(
      "PWRC_METAPLEX_RPC_URL_INVALID",
    );
  }

  return createUmi(
    rpcUrl,
  ).use(
    mplTokenMetadata(),
  );
}

export function getPwrcMetadataPda(
  umi: Pick<
    Umi,
    "eddsa" | "programs"
  >,
): PublicKey {
  const [metadataPda] =
    findMetadataPda(
      umi,
      {
        mint:
          publicKey(
            PWRC_METADATA.mint,
          ),
      },
    );

  return metadataPda;
}

export function getPwrcMetadataIdentity(
  umi: Pick<
    Umi,
    "eddsa" | "programs"
  >,
): PowerChainMetadataIdentity {
  return {
    mint:
      PWRC_METADATA.mint,
    tokenMetadataProgramId:
      PWRC_METADATA.tokenMetadataProgramId,
    metadataPda:
      getPwrcMetadataPda(
        umi,
      ).toString(),
    uri:
      PWRC_METADATA.uri,
    image:
      PWRC_METADATA.image,
  };
}

export async function fetchPwrcMetaplexMetadata(
  umi: Umi,
) {
  const metadataPda =
    findMetadataPda(
      umi,
      {
        mint:
          publicKey(
            PWRC_METADATA.mint,
          ),
      },
    );

  return await fetchMetadata(
    umi,
    metadataPda,
  );
}

/**
 * Canonical PWRC metadata writes are intentionally not exposed by this SDK.
 * Metadata authority mutation requires separate governance/deployment evidence.
 */
export function assertCanonicalMetadataWriteDisabled(): never {
  throw new Error(
    "PWRC_CANONICAL_METADATA_WRITE_DISABLED",
  );
}

export * from "./compatibility.js";

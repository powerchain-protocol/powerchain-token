import {
  METAPLEX_TOKEN_METADATA_PROGRAM_ID,
  PWRC_CANONICAL_MINT,
  PWRC_METADATA_IMAGE_URI,
  PWRC_METADATA_URI,
  WPWRC_METADATA_IMAGE_URI,
  WPWRC_METADATA_URI,
  WPWRC_NAME,
  WPWRC_SYMBOL,
} from "./constants.js";

export const PWRC_METADATA = {
  version: "1.0.0",
  mint: PWRC_CANONICAL_MINT,
  tokenMetadataProgramId:
    METAPLEX_TOKEN_METADATA_PROGRAM_ID,
  uri: PWRC_METADATA_URI,
  image: PWRC_METADATA_IMAGE_URI,
} as const;

export type PwrcMetadataIdentity =
  typeof PWRC_METADATA;

function assertHttpsUrl(
  value: string,
  expectedHost: string,
  code: string,
): URL {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(code);
  }

  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.hostname !== expectedHost
  ) {
    throw new Error(code);
  }

  return url;
}

export function assertCanonicalPwrcMetadata(): void {
  if (
    PWRC_METADATA.mint !==
      "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc" ||
    PWRC_METADATA.tokenMetadataProgramId !==
      "metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s"
  ) {
    throw new Error(
      "PWRC_METADATA_IDENTITY_CHANGED",
    );
  }

  assertHttpsUrl(
    PWRC_METADATA.uri,
    "token.powerchain.energy",
    "PWRC_METADATA_URI_INVALID",
  );

  assertHttpsUrl(
    PWRC_METADATA.image,
    "token.powerchain.energy",
    "PWRC_METADATA_IMAGE_URI_INVALID",
  );
}


export const WPWRC_METADATA = {
  version:
    "1.0.0",
  name:
    WPWRC_NAME,
  symbol:
    WPWRC_SYMBOL,
  chain:
    "sui",
  canonicalAsset:
    "PWRC",
  uri:
    WPWRC_METADATA_URI,
  image:
    WPWRC_METADATA_IMAGE_URI,
} as const;

export function assertCanonicalWpwrcMetadata(): void {
  if (
    WPWRC_METADATA.name !==
      "Wrapped PowerChain" ||
    WPWRC_METADATA.symbol !==
      "wPWRC" ||
    WPWRC_METADATA.chain !==
      "sui" ||
    WPWRC_METADATA.canonicalAsset !==
      "PWRC"
  ) {
    throw new Error(
      "WPWRC_METADATA_IDENTITY_CHANGED",
    );
  }

  assertHttpsUrl(
    WPWRC_METADATA.uri,
    "token.powerchain.energy",
    "WPWRC_METADATA_URI_INVALID",
  );

  assertHttpsUrl(
    WPWRC_METADATA.image,
    "token.powerchain.energy",
    "WPWRC_METADATA_IMAGE_URI_INVALID",
  );
}

import {
  canonicalTokenPolicy,
} from "./token-policy.mjs";
import {
  canonicalTokenDescription,
} from "./token-description.mjs";

export function publicMetadataState() {
  const policy =
    canonicalTokenPolicy();
  const native =
    policy.native;
  const description =
    canonicalTokenDescription();

  return {
    version:
      "1.0.0",
    name:
      description.name,
    symbol:
      description.symbol,
    description:
      description.description,
    shortDescription:
      description.shortDescription,
    categories:
      [...description.categories],
    useCases:
      [...description.useCases],
    disclaimer:
      description.disclaimer,
    descriptionSha256:
      description.descriptionSha256,
    renewableEnergyRelated:
      true,
    mint:
      native.mint,
    tokenProgram:
      native.tokenProgram,
    tokenMetadataProgram:
      native.metadata
        .metaplexProgram,
    uri:
      native.metadata.uri,
    image:
      native.metadata.image,
    token2022: {
      metadataPointer:
        true,
      metadataPointerTarget:
        native.metadata.pointer,
      tokenMetadata:
        true,
    },
    tokenPolicySha256:
      policy.policySha256,
    canonicalMetadataWriteExposed:
      false,
    publicWrites:
      false,
  };
}

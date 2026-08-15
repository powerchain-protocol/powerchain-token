import fs from "node:fs";
import crypto from "node:crypto";

function canonicalJson(
  value,
) {
  if (
    value === null ||
    typeof value !==
      "object"
  ) {
    return JSON.stringify(
      value,
    );
  }

  if (Array.isArray(value)) {
    return `[${value
      .map(canonicalJson)
      .join(",")}]`;
  }

  return `{${Object
    .keys(value)
    .sort()
    .map(
      (key) =>
        `${JSON.stringify(key)}:${canonicalJson(value[key])}`,
    )
    .join(",")}}`;
}

const document =
  JSON.parse(
    fs.readFileSync(
      "config/token-policy.json",
      "utf8",
    ),
  );

const {
  policySha256,
  ...policy
} =
  document;

const calculated =
  crypto
    .createHash(
      "sha256",
    )
    .update(
      canonicalJson({
        domain:
          "POWERCHAIN_PWRC_TOKEN_POLICY_V1",
        policy,
      }),
    )
    .digest(
      "hex",
    );

if (
  calculated !==
    policySha256
) {
  throw new Error(
    "PWRC_TOKEN_POLICY_COMMITMENT_MISMATCH",
  );
}

if (
  policy.version !==
    "1.0.0" ||
  policy.canonical !==
    true
) {
  throw new Error(
    "PWRC_TOKEN_POLICY_INVALID",
  );
}

export function canonicalTokenPolicy() {
  return {
    ...policy,
    policyDomain:
      "POWERCHAIN_PWRC_TOKEN_POLICY_V1",
    policySha256,
    publicWrites:
      false,
  };
}

export function canonicalNativeTokenPolicy() {
  const native =
    policy.native;

  return {
    version:
      policy.version,
    name:
      native.name,
    symbol:
      native.symbol,
    chain:
      native.chain,
    cluster:
      native.network,
    standard:
      native.standard,
    mint:
      native.mint,
    tokenProgramId:
      native.tokenProgram,
    metaplexProgramId:
      native.metadata
        .metaplexProgram,
    decimals:
      native.decimals,
    fixedSupply:
      native.fixedSupplyTokens,
    fixedSupplyBaseUnits:
      native.fixedSupplyBaseUnits,
    authorities: {
      mint:
        native.authorities
          .mintAuthorityAfterGenesis,
      freeze:
        native.authorities
          .freezeAuthority,
    },
    extensions: {
      required:
        native.extensions,
      forbidden: [
        "PermanentDelegate",
        "MintCloseAuthority",
        "DefaultAccountState",
        "InterestBearingConfig",
        "ScaledUiAmount",
        "PausableConfig",
      ],
    },
    nativeTransferFee: {
      basisPoints:
        Number(
          native.transferFee
            .basisPoints,
        ),
      percent:
        "2.5",
      maximumFeePwrc:
        "1000000",
      maximumFeeBaseUnits:
        native.transferFee
          .maximumFeeBaseUnits,
      capStartsAtPwrc:
        "40000000",
      capStartsAtBaseUnits:
        native.transferFee
          .capStartsAtGrossBaseUnits,
      rounding:
        native.transferFee
          .rounding,
    },
    metadata: {
      pointer:
        native.metadata.pointer,
      name:
        native.name,
      symbol:
        native.symbol,
      uri:
        native.metadata.uri,
    },
    verifier: {
      programId:
        "PWRCpWCpQ8BRn3pzMnvaTzMK9Q2GsxuLx7QgJgduLSu",
      verificationOnly:
        true,
      mintInstruction:
        false,
    },
    publicWrites:
      false,
  };
}


export function canonicalTokenEconomics() {
  const native =
    policy.native;

  return {
    fixedSupplyBaseUnits:
      BigInt(
        native.fixedSupplyBaseUnits,
      ),
    transferFeeBasisPoints:
      BigInt(
        native.transferFee.basisPoints,
      ),
    maximumTransferFeeBaseUnits:
      BigInt(
        native.transferFee.maximumFeeBaseUnits,
      ),
    feeCapStartsAtGrossBaseUnits:
      BigInt(
        native.transferFee.capStartsAtGrossBaseUnits,
      ),
  };
}

export function canonicalTokenSnapshot() {
  const native =
    policy.native;
  const wrapped =
    policy.wrapped;

  return {
    version:
      policy.version,
    policySha256,
    native: {
      name:
        native.name,
      symbol:
        native.symbol,
      mint:
        native.mint,
      standard:
        native.standard,
      tokenProgram:
        native.tokenProgram,
      decimals:
        native.decimals,
      fixedSupplyTokens:
        native.fixedSupplyTokens,
      fixedSupplyBaseUnits:
        native.fixedSupplyBaseUnits,
      transferFeeBasisPoints:
        Number(
          native.transferFee.basisPoints,
        ),
      maximumTransferFeeBaseUnits:
        native.transferFee.maximumFeeBaseUnits,
      feeCapStartsAtGrossBaseUnits:
        native.transferFee.capStartsAtGrossBaseUnits,
    },
    wrapped: {
      name:
        wrapped.name,
      symbol:
        wrapped.symbol,
      chain:
        wrapped.chain,
      decimals:
        wrapped.decimals,
      genesisSupplyBaseUnits:
        wrapped.genesisSupplyBaseUnits,
      canonicalBaseUnitsPerWrappedBaseUnit:
        wrapped.canonicalBaseUnitsPerWrappedBaseUnit,
    },
  };
}


export function canonicalTokenProfile() {
  const native =
    policy.native;

  return {
    version:
      policy.version,
    name:
      native.name,
    symbol:
      native.symbol,
    mint:
      native.mint,
    tokenProgram:
      native.tokenProgram,
    metadataProgram:
      native.metadata.metaplexProgram,
    decimals:
      native.decimals,
    genesisSupplyTokens:
      native.fixedSupplyTokens,
    genesisSupplyBaseUnits:
      native.fixedSupplyBaseUnits,
    nativeTransferFeeBps:
      Number(
        native.transferFee.basisPoints,
      ),
    nativeTransferFeeCapTokens:
      (
        BigInt(
          native.transferFee.maximumFeeBaseUnits,
        ) /
        1_000_000_000n
      ).toString(),
    nativeTransferFeeCapBaseUnits:
      native.transferFee.maximumFeeBaseUnits,
    feeCapStartsAtGrossBaseUnits:
      native.transferFee.capStartsAtGrossBaseUnits,
    policySha256,
  };
}

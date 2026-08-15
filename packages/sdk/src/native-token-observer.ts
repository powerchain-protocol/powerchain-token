import {
  ExtensionType,
  TOKEN_2022_PROGRAM_ID,
  getExtensionTypes,
  getMetadataPointerState,
  getMint,
  getTokenMetadata,
  getTransferFeeConfig,
} from "@solana/spl-token";
import {
  PublicKey,
  type Commitment,
  type Connection,
} from "@solana/web3.js";
import {
  resolveExpectedSolanaGenesisHash,
  type SolanaCluster,
} from "@powerchain/protocol/solana";
import {
  PWRC_CANONICAL_MINT,
} from "@powerchain/protocol/constants";
import {
  verifyNativePwrcMintObservation,
  verifyNativePwrcTransferFeeAuthorities,
  type NativePwrcMintObservation,
  type NativePwrcTransferFeeAuthorityPolicy,
  type NativePwrcVerificationResult,
} from "@powerchain/protocol/native-token";
import {
  createNativePwrcTransferFeeEpochEvidence,
  type NativePwrcTransferFeeEpochEvidence,
} from "@powerchain/protocol/native-transfer-fee-evidence";
import {
  assertNativePwrcConsensus,
  evaluateNativePwrcConsensus,
} from "@powerchain/protocol/native-token-consensus";
import {
  assertNativePwrcAttestation,
  evaluateNativePwrcAttestation,
  type NativePwrcAttestationSnapshot,
} from "@powerchain/protocol/native-token-attestation";

function extensionName(
  extension:
    ExtensionType,
): string {
  const value =
    ExtensionType[
      extension
    ];

  return typeof value ===
    "string"
    ? value
    : String(
        extension,
      );
}

function publicKeyOrNull(
  value:
    PublicKey |
    null |
    undefined,
): string |
  null {
  return value
    ? value.toBase58()
    : null;
}

export interface FetchNativePwrcObservationInput {
  connection:
    Connection;
  commitment?:
    Commitment;
  maxSlotSpan?:
    bigint;
  transferFeeAuthorityPolicy?:
    NativePwrcTransferFeeAuthorityPolicy;
}

export interface FetchNativePwrcObservationResult {
  observation:
    NativePwrcMintObservation;
  verification:
    NativePwrcVerificationResult;
  slot:
    bigint;
  slotStart:
    bigint;
  slotEnd:
    bigint;
  slotSpan:
    bigint;
  epoch:
    bigint;
  genesisHash:
    string;
  transferFeeEvidence:
    NativePwrcTransferFeeEpochEvidence;
}

export async function fetchNativePwrcMintObservation(
  input:
    FetchNativePwrcObservationInput,
): Promise<
  FetchNativePwrcObservationResult
> {
  const mintAddress =
    new PublicKey(
      PWRC_CANONICAL_MINT,
    );

  const commitment =
    input.commitment ??
    "finalized";

  const slotStart =
    BigInt(
      await input.connection
        .getSlot(
          commitment,
        ),
    );

  const accountInfo =
    await input.connection
      .getAccountInfo(
        mintAddress,
        commitment,
      );

  if (!accountInfo) {
    throw new Error(
      "PWRC_NATIVE_MINT_ACCOUNT_NOT_FOUND",
    );
  }

  const mint =
    await getMint(
      input.connection,
      mintAddress,
      commitment,
      TOKEN_2022_PROGRAM_ID,
    );

  const transferFeeConfig =
    getTransferFeeConfig(
      mint,
    );

  if (!transferFeeConfig) {
    throw new Error(
      "PWRC_NATIVE_TRANSFER_FEE_CONFIG_MISSING",
    );
  }

  const metadataPointer =
    getMetadataPointerState(
      mint,
    );

  if (!metadataPointer) {
    throw new Error(
      "PWRC_NATIVE_METADATA_POINTER_MISSING",
    );
  }

  const tokenMetadata =
    await getTokenMetadata(
      input.connection,
      mintAddress,
      commitment,
      TOKEN_2022_PROGRAM_ID,
    );

  if (!tokenMetadata) {
    throw new Error(
      "PWRC_NATIVE_TOKEN_METADATA_MISSING",
    );
  }

  const extensionTypes =
    getExtensionTypes(
      mint.tlvData,
    );

  const currentEpoch =
    BigInt(
      (
        await input.connection
          .getEpochInfo(
            commitment,
          )
      ).epoch,
    );

  const activeTransferFee =
    transferFeeConfig
      .newerTransferFee
      .epoch <=
        currentEpoch
      ? transferFeeConfig
          .newerTransferFee
      : transferFeeConfig
          .olderTransferFee;


  const genesisHash =
    await input.connection
      .getGenesisHash();

  const slotEnd =
    BigInt(
      await input.connection
        .getSlot(
          commitment,
        ),
    );

  if (
    slotEnd <
      slotStart
  ) {
    throw new Error(
      "PWRC_NATIVE_OBSERVATION_SLOT_REGRESSION",
    );
  }

  const slotSpan =
    slotEnd -
    slotStart;

  if (
    input.maxSlotSpan !==
      undefined &&
    (
      input.maxSlotSpan <
        0n ||
      slotSpan >
        input.maxSlotSpan
    )
  ) {
    throw new Error(
      "PWRC_NATIVE_OBSERVATION_SLOT_SPAN_EXCEEDED",
    );
  }

  const slot =
    slotEnd;

  const observation:
    NativePwrcMintObservation =
    {
      mint:
        mint.address
          .toBase58(),
      ownerProgramId:
        accountInfo.owner
          .toBase58(),
      decimals:
        mint.decimals,
      supplyBaseUnits:
        mint.supply,
      mintAuthority:
        publicKeyOrNull(
          mint.mintAuthority,
        ),
      freezeAuthority:
        publicKeyOrNull(
          mint.freezeAuthority,
        ),
      extensions:
        extensionTypes.map(
          extensionName,
        ),
      transferFeeBasisPoints:
        BigInt(
          activeTransferFee
            .transferFeeBasisPoints,
        ),
      maximumTransferFeeBaseUnits:
        activeTransferFee
          .maximumFee,
      transferFeeConfigAuthority:
        publicKeyOrNull(
          transferFeeConfig
            .transferFeeConfigAuthority,
        ),
      withdrawWithheldAuthority:
        publicKeyOrNull(
          transferFeeConfig
            .withdrawWithheldAuthority,
        ),
      metadataPointer:
        publicKeyOrNull(
          metadataPointer
            .metadataAddress,
        ),
      metadataName:
        tokenMetadata.name,
      metadataSymbol:
        tokenMetadata.symbol,
      metadataUri:
        tokenMetadata.uri,
    };

  const profileVerification =
    verifyNativePwrcMintObservation(
      observation,
    );
  const authorityVerification =
    input.transferFeeAuthorityPolicy
      ? verifyNativePwrcTransferFeeAuthorities(
          observation,
          input.transferFeeAuthorityPolicy,
        )
      : {
          version:
            "1.0.0" as const,
          valid:
            true,
          failures:
            [] as readonly string[],
        };

  const verification = {
    version:
      "1.0.0" as const,
    valid:
      profileVerification.valid &&
      authorityVerification.valid,
    failures: [
      ...profileVerification.failures,
      ...authorityVerification.failures,
    ],
  };

  return {
    observation,
    verification,
    slot,
    slotStart,
    slotEnd,
    slotSpan,
    epoch:
      currentEpoch,
    genesisHash,
    transferFeeEvidence:
      createNativePwrcTransferFeeEpochEvidence({
        epoch:
          currentEpoch,
        observedSlot:
          slot,
        observedAt:
          new Date()
            .toISOString(),
        transferFeeBasisPoints:
          observation
            .transferFeeBasisPoints,
        maximumTransferFeeBaseUnits:
          observation
            .maximumTransferFeeBaseUnits,
        transferFeeConfigAuthority:
          observation
            .transferFeeConfigAuthority,
        withdrawWithheldAuthority:
          observation
            .withdrawWithheldAuthority,
      }),
  };
}

export async function assertLiveNativePwrcMint(
  input:
    FetchNativePwrcObservationInput,
): Promise<
  NativePwrcMintObservation
> {
  const result =
    await fetchNativePwrcMintObservation(
      input,
    );

  if (
    !result.verification
      .valid
  ) {
    throw new Error(
      `PWRC_NATIVE_LIVE_VERIFICATION_FAILED:${result.verification.failures.join(",")}`,
    );
  }

  return result.observation;
}


export interface NativePwrcRpcObserver {
  name:
    string;
  connection:
    Connection;
}

export interface VerifyNativePwrcAcrossRpcsInput {
  observers:
    readonly NativePwrcRpcObserver[];
  commitment?:
    Commitment;
  minimumObservers?:
    number;
  observedAt?:
    string;
  now?:
    string;
  expectedGenesisHash?:
    string;
  maxObservationAgeMs?:
    number;
  maxSlotSkew?:
    bigint;
  maxIntraObservationSlotSkew?:
    bigint;
  maxEpochSkew?:
    bigint;
  transferFeeAuthorityPolicy?:
    NativePwrcTransferFeeAuthorityPolicy;
}

export async function verifyNativePwrcAcrossRpcs(
  input:
    VerifyNativePwrcAcrossRpcsInput,
) {
  const observedAt =
    input.observedAt ??
    new Date()
      .toISOString();


const maximumIntraObservationSlotSkew =
  input.maxIntraObservationSlotSkew ??
  input.maxSlotSkew ??
  128n;

if (
  maximumIntraObservationSlotSkew <
    0n
) {
  throw new Error(
    "PWRC_NATIVE_RPC_INTRA_OBSERVATION_SLOT_SKEW_INVALID",
  );
}

const observationResults =
  await Promise.all(
    input.observers.map(
      async (
        observer,
      ) => {
        if (
          !observer.name.trim()
        ) {
          throw new Error(
            "PWRC_NATIVE_RPC_OBSERVER_NAME_REQUIRED",
          );
        }

        const result =
          await fetchNativePwrcMintObservation({
            connection:
              observer.connection,
            commitment:
              input.commitment ??
              "finalized",
            maxSlotSpan:
              maximumIntraObservationSlotSkew,
            transferFeeAuthorityPolicy:
              input.transferFeeAuthorityPolicy,
          });

        return {
          observer:
            observer.name,
          result,
        };
      },
    ),
  );

const snapshots:
  NativePwrcAttestationSnapshot[] =
  [];

const verificationFailures:
  string[] =
  [];

for (
  const {
    observer,
    result,
  } of observationResults
) {
  if (
    !result.verification
      .valid
  ) {
    verificationFailures.push(
      `${observer}:${result.verification.failures.join("|")}`,
    );
  }

  snapshots.push({
    observer,
    observedAt,
    slot:
      result.slot,
    slotStart:
      result.slotStart,
    slotEnd:
      result.slotEnd,
    slotSpan:
      result.slotSpan,
    epoch:
      result.epoch,
    genesisHash:
      result.genesisHash,
    observation:
      result.observation,
  });
}

  if (
    verificationFailures.length
  ) {
    throw new Error(
      `PWRC_NATIVE_RPC_PROFILE_VERIFICATION_FAILED:${verificationFailures.join(",")}`,
    );
  }

  const consensus =
    evaluateNativePwrcConsensus(
      snapshots,
      input.minimumObservers ??
        2,
    );

  if (
    !consensus.consensus
  ) {
    throw new Error(
      `PWRC_NATIVE_RPC_CONSENSUS_FAILED:${consensus.failures.join(",")}`,
    );
  }

  const consensusSha256 =
    assertNativePwrcConsensus(
      snapshots,
      input.minimumObservers ??
        2,
    );

  const evaluationNow =
    input.now ??
    new Date()
      .toISOString();

  const attestationPolicy =
    input.expectedGenesisHash
      ? {
          expectedGenesisHash:
            input.expectedGenesisHash,
          minimumObservers:
            input.minimumObservers ??
            2,
          maxObservationAgeMs:
            input.maxObservationAgeMs ??
            60_000,
          maxSlotSkew:
            input.maxSlotSkew ??
            128n,
          maxIntraObservationSlotSkew:
            maximumIntraObservationSlotSkew,
          maxEpochSkew:
            input.maxEpochSkew ??
            1n,
        }
      : null;

  const attestation =
    attestationPolicy
      ? evaluateNativePwrcAttestation(
          snapshots,
          attestationPolicy,
          evaluationNow,
        )
      : null;

  if (
    attestation &&
    !attestation.valid
  ) {
    throw new Error(
      `PWRC_NATIVE_RPC_ATTESTATION_FAILED:${attestation.failures.join(",")}`,
    );
  }

  return {
    version:
      "1.0.0" as const,
    snapshots,
    consensus,
    consensusSha256,
    attestation,
    attestationSha256:
      attestation &&
      attestationPolicy
        ? assertNativePwrcAttestation(
            snapshots,
            attestationPolicy,
            evaluationNow,
          )
        : null,
  };
}


export interface VerifyConfiguredNativePwrcAcrossRpcsInput
  extends Omit<
    VerifyNativePwrcAcrossRpcsInput,
    "expectedGenesisHash"
  > {
  cluster:
    SolanaCluster;
  env?:
    NodeJS.ProcessEnv;
}

export async function verifyConfiguredNativePwrcAcrossRpcs(
  input:
    VerifyConfiguredNativePwrcAcrossRpcsInput,
) {
  const expectedGenesisHash =
    resolveExpectedSolanaGenesisHash(
      input.cluster,
      input.env ??
        process.env,
    );

  return verifyNativePwrcAcrossRpcs({
    ...input,
    expectedGenesisHash,
  });
}

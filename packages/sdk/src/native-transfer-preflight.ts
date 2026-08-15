import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_2022_PROGRAM_ID,
  getAccount,
  getAccountLenForMint,
  getAssociatedTokenAddressSync,
  getMint,
} from "@solana/spl-token";
import {
  type Commitment,
  type Connection,
  PublicKey,
} from "@solana/web3.js";
import {
  PWRC_CANONICAL_MINT,
  PWRC_GENESIS_BASE_UNITS,
} from "@powerchain/protocol/constants";
import {
  PWRC_TOKEN_POLICY_EXPECTED_SHA256,
} from "@powerchain/protocol/token-policy";
import {
  canonicalJsonSha256,
} from "@powerchain/protocol/helpers";
import {
  nativePwrcTransferPreview,
} from "@powerchain/protocol/native-token";
import {
  buildUnsignedNativePwrcTransferTransaction,
  serializeUnsignedNativePwrcTransaction,
} from "./native-token-transactions.js";

export interface NativePwrcTransferPreflightInput {
  connection:
    Connection;
  owner:
    string;
  destinationOwner:
    string;
  payer?:
    string;
  amountBaseUnits:
    bigint;
  commitment?:
    Commitment;
  ensureDestinationAta?:
    boolean;
  computeUnitLimit?:
    number;
  computeUnitPriceMicroLamports?:
    bigint |
    number;
  simulate?:
    boolean;
}

export interface NativePwrcTransferPreflightReport {
  version:
    "1.0.0";
  domain:
    "POWERCHAIN_NATIVE_PWRC_TRANSFER_PREFLIGHT_V1";
  mint:
    string;
  tokenPolicySha256:
    string;
  observedAt:
    string;
  observedSlot:
    number |
    null;
  commitment:
    Commitment;
  owner:
    string;
  destinationOwner:
    string;
  payer:
    string;
  sourceAta:
    string;
  destinationAta:
    string;
  grossBaseUnits:
    string;
  nativeTransferFeeBaseUnits:
    string;
  netBaseUnits:
    string;
  sourceBalanceBaseUnits:
    string |
    null;
  sourceAccountExists:
    boolean;
  sourceOwnerValid:
    boolean;
  sourceMintValid:
    boolean;
  sourceFrozen:
    boolean |
    null;
  sourceBalanceSufficient:
    boolean;
  destinationAccountExists:
    boolean;
  destinationOwnerValid:
    boolean |
    null;
  destinationMintValid:
    boolean |
    null;
  destinationFrozen:
    boolean |
    null;
  destinationAtaCreateRequired:
    boolean;
  destinationAtaCreateAllowed:
    boolean;
  latestBlockhash:
    string |
    null;
  lastValidBlockHeight:
    number |
    null;
  estimatedNetworkFeeLamports:
    string |
    null;
  estimatedDestinationAtaRentLamports:
    string;
  payerBalanceLamports:
    string |
    null;
  estimatedPayerDebitLamports:
    string |
    null;
  payerBalanceSufficient:
    boolean |
    null;
  simulationRequested:
    boolean;
  simulationAttempted:
    boolean;
  simulationSucceeded:
    boolean |
    null;
  simulationUnitsConsumed:
    number |
    null;
  simulationError:
    string |
    null;
  unsignedTransactionBase64:
    string |
    null;
  valid:
    boolean;
  failures:
    readonly string[];
  warnings:
    readonly string[];
  signingIncluded:
    false;
  submissionIncluded:
    false;
  publicWrites:
    false;
  reportSha256:
    string;
}

function key(
  value:
    string,
  code:
    string,
): PublicKey {
  try {
    return new PublicKey(
      value,
    );
  } catch {
    throw new Error(
      code,
    );
  }
}

function safeError(
  error:
    unknown,
): string {
  if (
    error instanceof Error
  ) {
    return error.message
      .replace(
        /https?:\/\/[^\s]+/g,
        "[redacted-url]",
      )
      .slice(
        0,
        256,
      );
  }

  return "PWRC_PREFLIGHT_UNKNOWN_ERROR";
}


const PREFLIGHT_REPORT_DOMAIN =
  "POWERCHAIN_NATIVE_PWRC_TRANSFER_PREFLIGHT_V1" as const;

const PREFLIGHT_REPORT_MAX_AGE_MS =
  120_000;

function preflightReportCommitment(
  report:
    Omit<
      NativePwrcTransferPreflightReport,
      "reportSha256"
    >,
): string {
  return canonicalJsonSha256({
    domain:
      PREFLIGHT_REPORT_DOMAIN,
    report,
  });
}

export function verifyNativePwrcTransferPreflightReport(
  report:
    NativePwrcTransferPreflightReport,
  now:
    string =
    new Date()
      .toISOString(),
  maxAgeMs:
    number =
    PREFLIGHT_REPORT_MAX_AGE_MS,
): NativePwrcTransferPreflightReport {
  if (
    report.version !==
      "1.0.0" ||
    report.domain !==
      PREFLIGHT_REPORT_DOMAIN
  ) {
    throw new Error(
      "PWRC_NATIVE_PREFLIGHT_REPORT_VERSION_INVALID",
    );
  }

  if (
    report.mint !==
      PWRC_CANONICAL_MINT ||
    report.tokenPolicySha256 !==
      PWRC_TOKEN_POLICY_EXPECTED_SHA256
  ) {
    throw new Error(
      "PWRC_NATIVE_PREFLIGHT_REPORT_POLICY_MISMATCH",
    );
  }

  if (
    report.observedSlot !==
      null &&
    (
      !Number.isSafeInteger(
        report.observedSlot,
      ) ||
      report.observedSlot <
        0
    )
  ) {
    throw new Error(
      "PWRC_NATIVE_PREFLIGHT_REPORT_SLOT_INVALID",
    );
  }

  if (
    !/^[a-f0-9]{64}$/.test(
      report.reportSha256,
    )
  ) {
    throw new Error(
      "PWRC_NATIVE_PREFLIGHT_REPORT_COMMITMENT_INVALID",
    );
  }

  if (
    report.signingIncluded !==
      false ||
    report.submissionIncluded !==
      false ||
    report.publicWrites !==
      false
  ) {
    throw new Error(
      "PWRC_NATIVE_PREFLIGHT_REPORT_CAPABILITY_INVALID",
    );
  }

  if (
    !Number.isSafeInteger(
      maxAgeMs,
    ) ||
    maxAgeMs <
      1 ||
    maxAgeMs >
      15 * 60_000
  ) {
    throw new Error(
      "PWRC_NATIVE_PREFLIGHT_REPORT_MAX_AGE_INVALID",
    );
  }

  const observedAtMs =
    Date.parse(
      report.observedAt,
    );
  const nowMs =
    Date.parse(
      now,
    );

  if (
    !Number.isFinite(
      observedAtMs,
    ) ||
    new Date(
      observedAtMs,
    ).toISOString() !==
      report.observedAt ||
    !Number.isFinite(
      nowMs,
    ) ||
    new Date(
      nowMs,
    ).toISOString() !==
      now
  ) {
    throw new Error(
      "PWRC_NATIVE_PREFLIGHT_REPORT_TIME_INVALID",
    );
  }

  if (
    observedAtMs >
      nowMs
  ) {
    throw new Error(
      "PWRC_NATIVE_PREFLIGHT_REPORT_FROM_FUTURE",
    );
  }

  if (
    nowMs -
      observedAtMs >
      maxAgeMs
  ) {
    throw new Error(
      "PWRC_NATIVE_PREFLIGHT_REPORT_STALE",
    );
  }

  const {
    reportSha256,
    ...payload
  } =
    report;

  const expected =
    preflightReportCommitment(
      payload,
    );

  if (
    reportSha256 !==
      expected
  ) {
    throw new Error(
      "PWRC_NATIVE_PREFLIGHT_REPORT_COMMITMENT_MISMATCH",
    );
  }

  return report;
}

export async function preflightNativePwrcTransfer(
  input:
    NativePwrcTransferPreflightInput,
): Promise<
  NativePwrcTransferPreflightReport
> {
  if (
    input.amountBaseUnits <=
      0n ||
    input.amountBaseUnits >
      PWRC_GENESIS_BASE_UNITS
  ) {
    throw new Error(
      "PWRC_NATIVE_PREFLIGHT_AMOUNT_INVALID",
    );
  }

  const observedAt =
    new Date()
      .toISOString();
  const commitment =
    input.commitment ??
    "confirmed";
  const owner =
    key(
      input.owner,
      "PWRC_NATIVE_PREFLIGHT_OWNER_INVALID",
    );
  const destinationOwner =
    key(
      input.destinationOwner,
      "PWRC_NATIVE_PREFLIGHT_DESTINATION_INVALID",
    );
  const payer =
    key(
      input.payer ??
        input.owner,
      "PWRC_NATIVE_PREFLIGHT_PAYER_INVALID",
    );
  const mint =
    new PublicKey(
      PWRC_CANONICAL_MINT,
    );

  if (
    owner.equals(
      destinationOwner,
    )
  ) {
    throw new Error(
      "PWRC_NATIVE_PREFLIGHT_SELF_TRANSFER_FORBIDDEN",
    );
  }

  const sourceAta =
    getAssociatedTokenAddressSync(
      mint,
      owner,
      false,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );
  const destinationAta =
    getAssociatedTokenAddressSync(
      mint,
      destinationOwner,
      false,
      TOKEN_2022_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );
  const preview =
    nativePwrcTransferPreview(
      input.amountBaseUnits,
    );
  const failures:
    string[] =
    [];
  const warnings:
    string[] =
    [];

  let sourceAccountExists =
    false;
  let sourceOwnerValid =
    false;
  let sourceMintValid =
    false;
  let sourceFrozen:
    boolean |
    null =
    null;
  let sourceBalanceBaseUnits:
    bigint |
    null =
    null;

  try {
    const sourceAccount =
      await getAccount(
        input.connection,
        sourceAta,
        commitment,
        TOKEN_2022_PROGRAM_ID,
      );

    sourceAccountExists =
      true;
    sourceOwnerValid =
      sourceAccount.owner.equals(
        owner,
      );
    sourceMintValid =
      sourceAccount.mint.equals(
        mint,
      );
    sourceFrozen =
      sourceAccount.isFrozen;
    sourceBalanceBaseUnits =
      sourceAccount.amount;
  } catch {
    failures.push(
      "PWRC_NATIVE_PREFLIGHT_SOURCE_ACCOUNT_MISSING_OR_INVALID",
    );
  }

  if (
    sourceAccountExists &&
    !sourceOwnerValid
  ) {
    failures.push(
      "PWRC_NATIVE_PREFLIGHT_SOURCE_OWNER_MISMATCH",
    );
  }

  if (
    sourceAccountExists &&
    !sourceMintValid
  ) {
    failures.push(
      "PWRC_NATIVE_PREFLIGHT_SOURCE_MINT_MISMATCH",
    );
  }

  if (
    sourceFrozen ===
      true
  ) {
    failures.push(
      "PWRC_NATIVE_PREFLIGHT_SOURCE_FROZEN",
    );
  }

  const sourceBalanceSufficient =
    sourceBalanceBaseUnits !==
      null &&
    sourceBalanceBaseUnits >=
      input.amountBaseUnits;

  if (
    sourceAccountExists &&
    !sourceBalanceSufficient
  ) {
    failures.push(
      "PWRC_NATIVE_PREFLIGHT_INSUFFICIENT_TOKEN_BALANCE",
    );
  }

  let destinationAccountExists =
    false;
  let destinationOwnerValid:
    boolean |
    null =
    null;
  let destinationMintValid:
    boolean |
    null =
    null;
  let destinationFrozen:
    boolean |
    null =
    null;

  const destinationAccountInfo =
    await input.connection
      .getAccountInfo(
        destinationAta,
        commitment,
      );

  destinationAccountExists =
    destinationAccountInfo !==
      null;

  if (
    destinationAccountExists
  ) {
    try {
      const destinationAccount =
        await getAccount(
          input.connection,
          destinationAta,
          commitment,
          TOKEN_2022_PROGRAM_ID,
        );

      destinationOwnerValid =
        destinationAccount.owner.equals(
          destinationOwner,
        );
      destinationMintValid =
        destinationAccount.mint.equals(
          mint,
        );
      destinationFrozen =
        destinationAccount.isFrozen;
    } catch {
      destinationOwnerValid =
        false;
      destinationMintValid =
        false;
      failures.push(
        "PWRC_NATIVE_PREFLIGHT_DESTINATION_ACCOUNT_INVALID",
      );
    }
  }

  if (
    destinationAccountExists &&
    destinationOwnerValid !==
      true
  ) {
    failures.push(
      "PWRC_NATIVE_PREFLIGHT_DESTINATION_OWNER_MISMATCH",
    );
  }

  if (
    destinationAccountExists &&
    destinationMintValid !==
      true
  ) {
    failures.push(
      "PWRC_NATIVE_PREFLIGHT_DESTINATION_MINT_MISMATCH",
    );
  }

  if (
    destinationFrozen ===
      true
  ) {
    failures.push(
      "PWRC_NATIVE_PREFLIGHT_DESTINATION_FROZEN",
    );
  }

  const ensureDestinationAta =
    input.ensureDestinationAta ??
    true;
  const destinationAtaCreateRequired =
    !destinationAccountExists;

  if (
    destinationAtaCreateRequired &&
    !ensureDestinationAta
  ) {
    failures.push(
      "PWRC_NATIVE_PREFLIGHT_DESTINATION_ATA_MISSING",
    );
  }

  if (
    destinationAtaCreateRequired &&
    ensureDestinationAta
  ) {
    warnings.push(
      "PWRC_NATIVE_PREFLIGHT_DESTINATION_ATA_CREATE_REQUIRED",
    );
  }

  let observedSlot:
    number |
    null =
    null;
  let latestBlockhash:
    string |
    null =
    null;
  let lastValidBlockHeight:
    number |
    null =
    null;
  let estimatedNetworkFeeLamports:
    bigint |
    null =
    null;
  let estimatedDestinationAtaRentLamports =
    0n;
  let payerBalanceLamports:
    bigint |
    null =
    null;
  let estimatedPayerDebitLamports:
    bigint |
    null =
    null;
  let payerBalanceSufficient:
    boolean |
    null =
    null;
  let unsignedTransactionBase64:
    string |
    null =
    null;
  let transaction:
    ReturnType<
      typeof buildUnsignedNativePwrcTransferTransaction
    > |
    null =
    null;

  try {
    observedSlot =
      await input.connection
        .getSlot(
          commitment,
        );

    const blockhash =
      await input.connection
        .getLatestBlockhash(
          commitment,
        );

    latestBlockhash =
      blockhash.blockhash;
    lastValidBlockHeight =
      blockhash.lastValidBlockHeight;

    transaction =
      buildUnsignedNativePwrcTransferTransaction({
        owner:
          owner.toBase58(),
        destinationOwner:
          destinationOwner.toBase58(),
        payer:
          payer.toBase58(),
        amountBaseUnits:
          input.amountBaseUnits,
        recentBlockhash:
          latestBlockhash,
        ensureDestinationAta:
          destinationAtaCreateRequired &&
          ensureDestinationAta,
        ...(
          input.computeUnitLimit !==
            undefined
            ? {
                computeUnitLimit:
                  input.computeUnitLimit,
              }
            : {}
        ),
        ...(
          input.computeUnitPriceMicroLamports !==
            undefined
            ? {
                computeUnitPriceMicroLamports:
                  input.computeUnitPriceMicroLamports,
              }
            : {}
        ),
      });

    unsignedTransactionBase64 =
      serializeUnsignedNativePwrcTransaction(
        transaction,
      );

    const fee =
      await input.connection
        .getFeeForMessage(
          transaction.compileMessage(),
          commitment,
        );

    if (
      fee.value ===
        null
    ) {
      failures.push(
        "PWRC_NATIVE_PREFLIGHT_FEE_ESTIMATE_UNAVAILABLE",
      );
    } else {
      estimatedNetworkFeeLamports =
        BigInt(
          fee.value,
        );
    }

    if (
      destinationAtaCreateRequired &&
      ensureDestinationAta
    ) {
      const mintState =
        await getMint(
          input.connection,
          mint,
          commitment,
          TOKEN_2022_PROGRAM_ID,
        );
      const destinationAccountLength =
        getAccountLenForMint(
          mintState,
        );

      estimatedDestinationAtaRentLamports =
        BigInt(
          await input.connection
            .getMinimumBalanceForRentExemption(
              destinationAccountLength,
              commitment,
            ),
        );
    }

    payerBalanceLamports =
      BigInt(
        await input.connection
          .getBalance(
            payer,
            commitment,
          ),
      );

    if (
      estimatedNetworkFeeLamports !==
        null
    ) {
      estimatedPayerDebitLamports =
        estimatedNetworkFeeLamports +
        estimatedDestinationAtaRentLamports;
      payerBalanceSufficient =
        payerBalanceLamports >=
        estimatedPayerDebitLamports;

      if (
        !payerBalanceSufficient
      ) {
        failures.push(
          "PWRC_NATIVE_PREFLIGHT_INSUFFICIENT_PAYER_SOL",
        );
      }
    }
  } catch (
    error
  ) {
    failures.push(
      `PWRC_NATIVE_PREFLIGHT_RPC_PREPARATION_FAILED:${safeError(error)}`,
    );
  }

  const simulationRequested =
    input.simulate !==
      false;
  let simulationAttempted =
    false;
  let simulationSucceeded:
    boolean |
    null =
    null;
  let simulationUnitsConsumed:
    number |
    null =
    null;
  let simulationError:
    string |
    null =
    null;

  if (
    simulationRequested &&
    transaction
  ) {
    simulationAttempted =
      true;

    try {
      const simulation =
        await input.connection
          .simulateTransaction(
            transaction,
          );

      simulationError =
        simulation.value.err ===
          null
          ? null
          : JSON.stringify(
              simulation.value.err,
            ).slice(
              0,
              512,
            );
      simulationUnitsConsumed =
        simulation.value
          .unitsConsumed ??
        null;
      simulationSucceeded =
        simulation.value.err ===
        null;

      if (
        !simulationSucceeded
      ) {
        failures.push(
          "PWRC_NATIVE_PREFLIGHT_SIMULATION_FAILED",
        );
      }
    } catch (
      error
    ) {
      simulationSucceeded =
        false;
      simulationError =
        safeError(
          error,
        );
      failures.push(
        "PWRC_NATIVE_PREFLIGHT_SIMULATION_UNAVAILABLE",
      );
    }
  }

  const report = {
    version:
      "1.0.0",
    domain:
      PREFLIGHT_REPORT_DOMAIN,
    mint:
      mint.toBase58(),
    tokenPolicySha256:
      PWRC_TOKEN_POLICY_EXPECTED_SHA256,
    observedAt,
    observedSlot,
    commitment,
    owner:
      owner.toBase58(),
    destinationOwner:
      destinationOwner.toBase58(),
    payer:
      payer.toBase58(),
    sourceAta:
      sourceAta.toBase58(),
    destinationAta:
      destinationAta.toBase58(),
    grossBaseUnits:
      input.amountBaseUnits
        .toString(),
    nativeTransferFeeBaseUnits:
      preview
        .nativeTransferFeeBaseUnits
        .toString(),
    netBaseUnits:
      preview.netBaseUnits
        .toString(),
    sourceBalanceBaseUnits:
      sourceBalanceBaseUnits
        ?.toString() ??
      null,
    sourceAccountExists,
    sourceOwnerValid,
    sourceMintValid,
    sourceFrozen,
    sourceBalanceSufficient,
    destinationAccountExists,
    destinationOwnerValid,
    destinationMintValid,
    destinationFrozen,
    destinationAtaCreateRequired,
    destinationAtaCreateAllowed:
      ensureDestinationAta,
    latestBlockhash,
    lastValidBlockHeight,
    estimatedNetworkFeeLamports:
      estimatedNetworkFeeLamports
        ?.toString() ??
      null,
    estimatedDestinationAtaRentLamports:
      estimatedDestinationAtaRentLamports
        .toString(),
    payerBalanceLamports:
      payerBalanceLamports
        ?.toString() ??
      null,
    estimatedPayerDebitLamports:
      estimatedPayerDebitLamports
        ?.toString() ??
      null,
    payerBalanceSufficient,
    simulationRequested,
    simulationAttempted,
    simulationSucceeded,
    simulationUnitsConsumed,
    simulationError,
    unsignedTransactionBase64,
    valid:
      failures.length ===
      0,
    failures,
    warnings,
    signingIncluded:
      false,
    submissionIncluded:
      false,
    publicWrites:
      false,
    } satisfies Omit<
    NativePwrcTransferPreflightReport,
    "reportSha256"
  >;

  return {
    ...report,
    reportSha256:
      preflightReportCommitment(
        report,
      ),
  };
}

import fs from "node:fs";
import {
  readJsonFileSync,
} from "../../../utils/config.mjs";
import {
  runCommandSync,
} from "../../../utils/process.mjs";
import {
  canonicalJsonSha256,
} from "../../../utils/crypto.mjs";
import {
  TtlCache,
} from "./cache.mjs";
import {
  PWRC_CANONICAL_MINT,
  PWRC_DECIMALS,
  PWRC_GENESIS_SUPPLY_BASE_UNITS,
  PWRC_GENESIS_SUPPLY_TOKENS,
  PWRC_TRANSFER_FEE_BASIS_POINTS,
  PWRC_MAXIMUM_TRANSFER_FEE_BASE_UNITS,
  PWRC_MAXIMUM_TRANSFER_FEE_TOKENS,
  SOLANA_TOKEN_2022_PROGRAM_ID,
} from "../../../utils/constants.mjs";

const BPS_DENOMINATOR =
  10_000n;

const MAX_TRANSFER_FEE =
  BigInt(
    PWRC_MAXIMUM_TRANSFER_FEE_BASE_UNITS,
  );

const MAX_SUPPLY =
  BigInt(
    PWRC_GENESIS_SUPPLY_BASE_UNITS,
  );

const mainnetStatusCache =
  new TtlCache({
    ttlMs: 2_000,
  });


export function tokenProfile() {
  return {
    version: "1.0.0",
    name: "PowerChain",
    symbol: "PWRC",
    canonicalChain:
      "solana",
    network:
      "mainnet-beta",
    tokenProgram:
      SOLANA_TOKEN_2022_PROGRAM_ID,
    mint:
      PWRC_CANONICAL_MINT,
    decimals:
      PWRC_DECIMALS,
    genesisSupplyTokens:
      PWRC_GENESIS_SUPPLY_TOKENS,
    genesisSupplyBaseUnits:
      PWRC_GENESIS_SUPPLY_BASE_UNITS,
    transferFee: {
      basisPoints:
        PWRC_TRANSFER_FEE_BASIS_POINTS,
      maximumFeeTokens:
        PWRC_MAXIMUM_TRANSFER_FEE_TOKENS,
      maximumFeeBaseUnits:
        PWRC_MAXIMUM_TRANSFER_FEE_BASE_UNITS,
      implementation:
        "Token-2022 TransferFeeConfig",
    },
    wrapped: {
      symbol:
        "wPWRC",
      chain:
        "sui",
      decimals:
        PWRC_DECIMALS,
      genesisSupplyBaseUnits:
        "0",
    },
  };
}

function parsePositiveBaseUnits(
  value,
) {
  if (
    typeof value !==
      "string" ||
    !/^[1-9]\d*$/.test(
      value,
    )
  ) {
    const error =
      new Error(
        "PWRC_AMOUNT_BASE_UNITS_INVALID",
      );
    error.statusCode = 400;
    throw error;
  }

  const amount =
    BigInt(value);

  if (amount > MAX_SUPPLY) {
    const error =
      new Error(
        "PWRC_AMOUNT_EXCEEDS_MAX_SUPPLY",
      );
    error.statusCode = 400;
    throw error;
  }

  return amount;
}

export function quoteBridge(
  input,
) {
  if (
    !input ||
    typeof input !==
      "object" ||
    Array.isArray(input)
  ) {
    const error =
      new Error(
        "PWRC_QUOTE_INPUT_INVALID",
      );
    error.statusCode = 400;
    throw error;
  }

  const direction =
    input.direction;

  if (
    direction !==
      "solana-to-sui" &&
    direction !==
      "sui-to-solana"
  ) {
    const error =
      new Error(
        "PWRC_BRIDGE_DIRECTION_INVALID",
      );
    error.statusCode = 400;
    throw error;
  }

  const amount =
    parsePositiveBaseUnits(
      input.amountBaseUnits,
    );

  const feeCandidate =
    (
      amount *
        BigInt(
          PWRC_TRANSFER_FEE_BASIS_POINTS,
        ) +
      BPS_DENOMINATOR -
      1n
    ) /
    BPS_DENOMINATOR;

  const fee =
    feeCandidate >
      MAX_TRANSFER_FEE
      ? MAX_TRANSFER_FEE
      : feeCandidate;

  const net =
    amount - fee;

  const quote = {
    version: "1.0.0",
    direction,
    grossAmountBaseUnits:
      amount.toString(),
    transferFeeBaseUnits:
      fee.toString(),
    netAmountBaseUnits:
      net.toString(),
    wrappedAmountBaseUnits:
      direction ===
        "solana-to-sui"
        ? net.toString()
        : amount.toString(),
    solanaRecipientAmountBaseUnits:
      direction ===
        "sui-to-solana"
        ? net.toString()
        : null,
    feePolicy: {
      basisPoints:
        PWRC_TRANSFER_FEE_BASIS_POINTS,
      maximumFeeBaseUnits:
        PWRC_MAXIMUM_TRANSFER_FEE_BASE_UNITS,
      source:
        "Token-2022 TransferFeeConfig",
    },
  };

  return {
    ...quote,
    fingerprint:
      canonicalJsonSha256(
        quote,
      ),
  };
}

function loadMainnetStatus() {
  const run =
    runCommandSync({
      command:
        process.execPath,
      args: [
        "scripts/mainnet/status.mjs",
      ],
      allowFailure: true,
      timeoutMs:
        15_000,
      maxOutputBytes:
        500_000,
    });

  if (
    !fs.existsSync(
      "reports/mainnet-status.json",
    )
  ) {
    return {
      ok: false,
      codeReady: false,
      buildReady: false,
      deploymentEvidenceReady:
        false,
      releaseAuthorized:
        false,
      readyForMainnet:
        false,
      releaseState:
        "UNKNOWN",
      blockers: [
        "mainnet-status-unavailable",
      ],
      commandOk:
        run.ok,
    };
  }

  const status =
    readJsonFileSync(
      "reports/mainnet-status.json",
    );

  return {
    ...status,
    commandOk:
      run.ok,
  };
}

export function refreshMainnetStatus({
  fresh = false,
} = {}) {
  if (fresh) {
    mainnetStatusCache.clear();
  }

  return mainnetStatusCache.get(
    loadMainnetStatus,
  );
}

export function healthSnapshot() {
  return {
    ok: true,
    version: "1.0.0",
    service:
      "@powerchain/api",
    status:
      "healthy",
    timestamp:
      new Date()
        .toISOString(),
  };
}

export function readinessSnapshot() {
  const mainnet =
    refreshMainnetStatus();

  return {
    ok:
      mainnet.codeReady ===
      true,
    version: "1.0.0",
    service:
      "@powerchain/api",
    codeReady:
      mainnet.codeReady ===
      true,
    buildReady:
      mainnet.buildReady ===
      true,
    deploymentEvidenceReady:
      mainnet.deploymentEvidenceReady ===
      true,
    releaseAuthorized:
      mainnet.releaseAuthorized ===
      true,
    readyForMainnet:
      mainnet.readyForMainnet ===
      true,
    releaseState:
      mainnet.releaseState ??
      "UNKNOWN",
    blockers:
      Array.isArray(
        mainnet.blockers,
      )
        ? mainnet.blockers
        : [],
  };
}

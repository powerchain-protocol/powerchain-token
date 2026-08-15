import {
  PWRC_GENESIS_BASE_UNITS,
} from "./constants.js";
import {
  assertSolana32ByteBase58,
  canonicalJsonSha256,
} from "./helpers.js";

export type PwrcUtilityWorkload =
  | "ai-inference"
  | "ai-agent"
  | "embedding"
  | "storage"
  | "api-compute";

export interface PwrcUtilityAuthorizationInput {
  requestId:
    string;
  idempotencyKey:
    string;
  wallet:
    string;
  workload:
    PwrcUtilityWorkload;
  units:
    bigint;
  unitPriceBaseUnits:
    bigint;
  maxSpendBaseUnits:
    bigint;
  issuedAt:
    string;
  expiresAt:
    string;
}

export interface PwrcUtilityAuthorization {
  version:
    "1.0.0";
  requestId:
    string;
  idempotencyKey:
    string;
  wallet:
    string;
  workload:
    PwrcUtilityWorkload;
  units:
    string;
  unitPriceBaseUnits:
    string;
  estimatedSpendBaseUnits:
    string;
  maxSpendBaseUnits:
    string;
  issuedAt:
    string;
  expiresAt:
    string;
  authorizationSha256:
    string;
}

function assertOpaqueId(
  value:
    string,
  code:
    string,
): void {
  if (
    !/^[A-Za-z0-9._:-]{8,128}$/.test(
      value,
    )
  ) {
    throw new Error(
      code,
    );
  }
}

function assertIso(
  value:
    string,
  code:
    string,
): number {
  const parsed =
    Date.parse(
      value,
    );

  if (
    !Number.isFinite(
      parsed,
    ) ||
    new Date(
      parsed,
    ).toISOString() !==
      value
  ) {
    throw new Error(
      code,
    );
  }

  return parsed;
}

export function createPwrcUtilityAuthorization(
  input:
    PwrcUtilityAuthorizationInput,
): PwrcUtilityAuthorization {
  assertOpaqueId(
    input.requestId,
    "PWRC_UTILITY_REQUEST_ID_INVALID",
  );
  assertOpaqueId(
    input.idempotencyKey,
    "PWRC_UTILITY_IDEMPOTENCY_KEY_INVALID",
  );
  const wallet =
    assertSolana32ByteBase58(
      input.wallet,
      "PWRC_UTILITY_WALLET_INVALID",
    );

  if (
    input.units <=
      0n ||
    input.unitPriceBaseUnits <
      0n ||
    input.maxSpendBaseUnits <=
      0n
  ) {
    throw new Error(
      "PWRC_UTILITY_AMOUNT_INVALID",
    );
  }

  if (
    input.unitPriceBaseUnits >
      0n &&
    input.units >
      input.maxSpendBaseUnits /
        input.unitPriceBaseUnits
  ) {
    throw new Error(
      "PWRC_UTILITY_MAX_SPEND_EXCEEDED",
    );
  }

  const estimatedSpendBaseUnits =
    input.units *
    input.unitPriceBaseUnits;

  if (
    estimatedSpendBaseUnits >
      input.maxSpendBaseUnits
  ) {
    throw new Error(
      "PWRC_UTILITY_MAX_SPEND_EXCEEDED",
    );
  }

  if (
    estimatedSpendBaseUnits >
      PWRC_GENESIS_BASE_UNITS ||
    input.maxSpendBaseUnits >
      PWRC_GENESIS_BASE_UNITS
  ) {
    throw new Error(
      "PWRC_UTILITY_SUPPLY_BOUND_EXCEEDED",
    );
  }

  const issuedAt =
    assertIso(
      input.issuedAt,
      "PWRC_UTILITY_ISSUED_AT_INVALID",
    );
  const expiresAt =
    assertIso(
      input.expiresAt,
      "PWRC_UTILITY_EXPIRES_AT_INVALID",
    );

  if (
    expiresAt <=
      issuedAt ||
    expiresAt -
      issuedAt >
      15 * 60_000
  ) {
    throw new Error(
      "PWRC_UTILITY_EXPIRY_INVALID",
    );
  }

  const payload = {
    version:
      "1.0.0" as const,
    requestId:
      input.requestId,
    idempotencyKey:
      input.idempotencyKey,
    wallet,
    workload:
      input.workload,
    units:
      input.units
        .toString(),
    unitPriceBaseUnits:
      input.unitPriceBaseUnits
        .toString(),
    estimatedSpendBaseUnits:
      estimatedSpendBaseUnits
        .toString(),
    maxSpendBaseUnits:
      input.maxSpendBaseUnits
        .toString(),
    issuedAt:
      input.issuedAt,
    expiresAt:
      input.expiresAt,
  };

  return {
    ...payload,
    authorizationSha256:
      canonicalJsonSha256({
        domain:
          "POWERCHAIN_PWRC_UTILITY_AUTHORIZATION_V1",
        authorization:
          payload,
      }),
  };
}

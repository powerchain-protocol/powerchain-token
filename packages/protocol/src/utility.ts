import {
  PWRC_CANONICAL_MINT,
  PWRC_GENESIS_BASE_UNITS,
} from "./constants.js";
import {
  assertSolana32ByteBase58,
  canonicalJson,
  canonicalJsonSha256,
  sha256Hex,
} from "./helpers.js";
import {
  PWRC_TOKEN_POLICY_EXPECTED_SHA256,
} from "./token-policy.js";

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

export type PwrcUtilityNetwork =
  | "mainnet-beta"
  | "devnet";

export interface PwrcUtilityWalletAuthorizationInput {
  network:
    PwrcUtilityNetwork;
  serviceId:
    string;
  recipient:
    string;
  nonce:
    string;
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

export interface PwrcUtilityWalletAuthorization {
  version:
    "1.0.0";
  domain:
    "POWERCHAIN_PWRC_UTILITY_WALLET_AUTHORIZATION_V1";
  network:
    PwrcUtilityNetwork;
  mint:
    string;
  tokenPolicySha256:
    string;
  serviceId:
    string;
  recipient:
    string;
  nonce:
    string;
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
  walletMessage:
    string;
  walletMessageSha256:
    string;
  authorizationSha256:
    string;
  signatureIncluded:
    false;
}

const UTILITY_WALLET_AUTHORIZATION_DOMAIN =
  "POWERCHAIN_PWRC_UTILITY_WALLET_AUTHORIZATION_V1" as const;

function assertUtilityNetwork(
  value:
    string,
): asserts value is
  PwrcUtilityNetwork {
  if (
    value !==
      "mainnet-beta" &&
    value !==
      "devnet"
  ) {
    throw new Error(
      "PWRC_UTILITY_NETWORK_INVALID",
    );
  }
}

function walletAuthorizationPayload(
  input:
    PwrcUtilityWalletAuthorizationInput,
) {
  assertUtilityNetwork(
    input.network,
  );
  assertOpaqueId(
    input.serviceId,
    "PWRC_UTILITY_SERVICE_ID_INVALID",
  );
  assertOpaqueId(
    input.nonce,
    "PWRC_UTILITY_NONCE_INVALID",
  );
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
  const recipient =
    assertSolana32ByteBase58(
      input.recipient,
      "PWRC_UTILITY_RECIPIENT_INVALID",
    );

  if (
    wallet ===
      recipient
  ) {
    throw new Error(
      "PWRC_UTILITY_RECIPIENT_SELF_FORBIDDEN",
    );
  }

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

  return {
    version:
      "1.0.0" as const,
    domain:
      UTILITY_WALLET_AUTHORIZATION_DOMAIN,
    network:
      input.network,
    mint:
      PWRC_CANONICAL_MINT,
    tokenPolicySha256:
      PWRC_TOKEN_POLICY_EXPECTED_SHA256,
    serviceId:
      input.serviceId,
    recipient,
    nonce:
      input.nonce,
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
}

export function createPwrcUtilityWalletAuthorization(
  input:
    PwrcUtilityWalletAuthorizationInput,
): PwrcUtilityWalletAuthorization {
  const payload =
    walletAuthorizationPayload(
      input,
    );

  const walletMessage =
    `${UTILITY_WALLET_AUTHORIZATION_DOMAIN}\n${canonicalJson(payload)}`;

  return {
    ...payload,
    walletMessage,
    walletMessageSha256:
      sha256Hex(
        walletMessage,
      ),
    authorizationSha256:
      canonicalJsonSha256({
        domain:
          UTILITY_WALLET_AUTHORIZATION_DOMAIN,
        authorization:
          payload,
      }),
    signatureIncluded:
      false,
  };
}

function parseCanonicalUtilityInteger(
  value:
    string,
  code:
    string,
): bigint {
  if (
    !/^(0|[1-9][0-9]*)$/.test(
      value,
    )
  ) {
    throw new Error(
      code,
    );
  }

  return BigInt(
    value,
  );
}

export function verifyPwrcUtilityWalletAuthorization(
  authorization:
    PwrcUtilityWalletAuthorization,
  now:
    string,
): PwrcUtilityWalletAuthorization {
  if (
    authorization.version !==
      "1.0.0" ||
    authorization.domain !==
      UTILITY_WALLET_AUTHORIZATION_DOMAIN
  ) {
    throw new Error(
      "PWRC_UTILITY_WALLET_AUTH_VERSION_INVALID",
    );
  }

  if (
    authorization.mint !==
      PWRC_CANONICAL_MINT
  ) {
    throw new Error(
      "PWRC_UTILITY_WALLET_AUTH_MINT_MISMATCH",
    );
  }

  if (
    authorization.tokenPolicySha256 !==
      PWRC_TOKEN_POLICY_EXPECTED_SHA256
  ) {
    throw new Error(
      "PWRC_UTILITY_WALLET_AUTH_TOKEN_POLICY_MISMATCH",
    );
  }

  const rebuilt =
    createPwrcUtilityWalletAuthorization({
      network:
        authorization.network,
      serviceId:
        authorization.serviceId,
      recipient:
        authorization.recipient,
      nonce:
        authorization.nonce,
      requestId:
        authorization.requestId,
      idempotencyKey:
        authorization.idempotencyKey,
      wallet:
        authorization.wallet,
      workload:
        authorization.workload,
      units:
        parseCanonicalUtilityInteger(
          authorization.units,
          "PWRC_UTILITY_WALLET_AUTH_UNITS_INVALID",
        ),
      unitPriceBaseUnits:
        parseCanonicalUtilityInteger(
          authorization.unitPriceBaseUnits,
          "PWRC_UTILITY_WALLET_AUTH_UNIT_PRICE_INVALID",
        ),
      maxSpendBaseUnits:
        parseCanonicalUtilityInteger(
          authorization.maxSpendBaseUnits,
          "PWRC_UTILITY_WALLET_AUTH_MAX_SPEND_INVALID",
        ),
      issuedAt:
        authorization.issuedAt,
      expiresAt:
        authorization.expiresAt,
    });

  for (const [
    actual,
    expected,
    code,
  ] of [
    [
      authorization.estimatedSpendBaseUnits,
      rebuilt.estimatedSpendBaseUnits,
      "PWRC_UTILITY_WALLET_AUTH_SPEND_MISMATCH",
    ],
    [
      authorization.walletMessage,
      rebuilt.walletMessage,
      "PWRC_UTILITY_WALLET_AUTH_MESSAGE_MISMATCH",
    ],
    [
      authorization.walletMessageSha256,
      rebuilt.walletMessageSha256,
      "PWRC_UTILITY_WALLET_AUTH_MESSAGE_HASH_MISMATCH",
    ],
    [
      authorization.authorizationSha256,
      rebuilt.authorizationSha256,
      "PWRC_UTILITY_WALLET_AUTH_COMMITMENT_MISMATCH",
    ],
  ] as const) {
    if (
      actual !==
        expected
    ) {
      throw new Error(
        code,
      );
    }
  }

  if (
    authorization.signatureIncluded !==
      false
  ) {
    throw new Error(
      "PWRC_UTILITY_WALLET_AUTH_SIGNATURE_STATE_INVALID",
    );
  }

  const nowMs =
    assertIso(
      now,
      "PWRC_UTILITY_WALLET_AUTH_NOW_INVALID",
    );
  const issuedAtMs =
    Date.parse(
      authorization.issuedAt,
    );
  const expiresAtMs =
    Date.parse(
      authorization.expiresAt,
    );

  if (
    nowMs <
      issuedAtMs
  ) {
    throw new Error(
      "PWRC_UTILITY_WALLET_AUTH_NOT_YET_VALID",
    );
  }

  if (
    nowMs >=
      expiresAtMs
  ) {
    throw new Error(
      "PWRC_UTILITY_WALLET_AUTH_EXPIRED",
    );
  }

  return rebuilt;
}

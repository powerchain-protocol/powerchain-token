import crypto from "node:crypto";

const BPS_DENOMINATOR = 10_000n;
const NATIVE_FEE_BPS = 250n;
const NATIVE_FEE_CAP = 1_000_000_000_000_000n;
const U64_MAX = 18_446_744_073_709_551_615n;

const OPERATIONS = new Set([
  "bridge-solana-to-sui",
  "bridge-sui-to-solana",
  "wallet-transfer",
  "quote-preview",
]);


const BASE58_ALPHABET =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function assertSolanaAddress(
  value,
) {
  const raw =
    value?.trim();

  if (
    !raw ||
    raw.length < 32 ||
    raw.length > 44
  ) {
    throw new Error(
      "PWRC_SOLANA_ADDRESS_INVALID",
    );
  }

  let number = 0n;

  for (const character of raw) {
    const index =
      BASE58_ALPHABET.indexOf(
        character,
      );

    if (index < 0) {
      throw new Error(
        "PWRC_SOLANA_ADDRESS_INVALID",
      );
    }

    number =
      number * 58n +
      BigInt(index);
  }

  const bytes = [];

  while (number > 0n) {
    bytes.push(
      Number(
        number & 0xffn,
      ),
    );
    number >>= 8n;
  }

  let leadingZeroes =
    0;

  for (const character of raw) {
    if (character !== "1") {
      break;
    }
    leadingZeroes += 1;
  }

  if (
    bytes.length +
      leadingZeroes !==
    32
  ) {
    throw new Error(
      "PWRC_SOLANA_ADDRESS_INVALID",
    );
  }

  return raw;
}

const SERVICE_OPERATIONS = new Set([
  "bridge-solana-to-sui",
  "bridge-sui-to-solana",
]);

function ceilDiv(a, b) {
  return (a + b - 1n) / b;
}

export function parseBaseUnits(raw) {
  if (!/^[1-9][0-9]*$/.test(raw ?? "")) {
    throw new Error("PWRC_AMOUNT_INVALID");
  }

  const value = BigInt(raw);

  if (value > U64_MAX) {
    throw new Error("PWRC_AMOUNT_EXCEEDS_U64");
  }

  return value;
}

export function parseOperation(raw) {
  const operation = raw || "quote-preview";
  if (!OPERATIONS.has(operation)) {
    throw new Error("PWRC_OPERATION_INVALID");
  }
  return operation;
}

export function parseServiceFeeBps(raw) {
  if (!/^\d+$/.test(raw ?? "")) {
    throw new Error("PWRC_SERVICE_FEE_BPS_INVALID");
  }
  const value = Number(raw);
  if (!Number.isSafeInteger(value) || value < 0 || value > 10_000) {
    throw new Error("PWRC_SERVICE_FEE_BPS_INVALID");
  }
  return value;
}

export function nativeFee(gross) {
  const calculated =
    ceilDiv(gross * NATIVE_FEE_BPS, BPS_DENOMINATOR);

  return calculated > NATIVE_FEE_CAP
    ? NATIVE_FEE_CAP
    : calculated;
}

export function grossUp(net) {
  if (net === 0n) {
    return { gross: 0n, fee: 0n, net: 0n };
  }

  let low = net;
  let high = net + NATIVE_FEE_CAP + 1n;

  while (low < high) {
    const middle = (low + high) / 2n;
    const fee = nativeFee(middle);
    if (middle - fee >= net) high = middle;
    else low = middle + 1n;
  }

  const fee = nativeFee(low);

  return {
    gross: low,
    fee,
    net: low - fee,
  };
}

function stableStringify(value) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(stableStringify).join(",")}]`;
  }
  return `{${Object.keys(value).sort().map(
    (key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`
  ).join(",")}}`;
}

export function buildFeeQuote({
  amount,
  operation,
  serviceEnabled,
  serviceBps,
  serviceRecipient,
  ttlMs = 30_000,
  now = Date.now(),
}) {
  const principalFee = nativeFee(amount);
  const serviceAllowed = SERVICE_OPERATIONS.has(operation);
  const enabled = serviceEnabled && serviceAllowed;

  if (enabled && !serviceRecipient) {
    throw new Error("PWRC_SERVICE_FEE_RECIPIENT_REQUIRED");
  }

  const serviceNet = enabled
    ? ceilDiv(amount * BigInt(serviceBps), BPS_DENOMINATOR)
    : 0n;
  const serviceSourceChain =
    enabled
      ? operation === "bridge-solana-to-sui"
        ? "solana"
        : "sui"
      : null;
  const serviceAsset =
    serviceSourceChain === "solana"
      ? "PWRC"
      : serviceSourceChain === "sui"
        ? "wPWRC"
        : null;
  const service =
    serviceSourceChain === "solana"
      ? grossUp(serviceNet)
      : {
          gross: serviceNet,
          fee: 0n,
          net: serviceNet,
        };

  const payload = {
    version: "1.0.0",
    operation,
    principalGrossBaseUnits: amount.toString(),
    nativeTransferFeeBaseUnits: principalFee.toString(),
    principalNetBaseUnits: (amount - principalFee).toString(),
    serviceFeeEnabled: enabled,
    serviceFeeBasisPoints: enabled ? serviceBps : 0,
    serviceFeeNetBaseUnits: serviceNet.toString(),
    serviceFeeGrossTransferBaseUnits: service.gross.toString(),
    serviceFeeTransferNativeFeeBaseUnits: service.fee.toString(),
    serviceFeeRecipient: enabled ? serviceRecipient : null,
    serviceFeeSourceChain: serviceSourceChain,
    serviceFeeAsset: serviceAsset,
    totalNativeTokenFeesBaseUnits: (principalFee + service.fee).toString(),
    totalSourceDebitBaseUnits: (amount + service.gross).toString(),
    totalWalletPwrcDebitBaseUnits: (amount + service.gross).toString(),
    issuedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + ttlMs).toISOString(),
  };

  const quoteFingerprint = crypto
    .createHash("sha256")
    .update("POWERCHAIN_FEE_QUOTE_V1\0")
    .update(stableStringify(payload))
    .digest("hex");

  return {
    ...payload,
    quoteFingerprint,
  };
}

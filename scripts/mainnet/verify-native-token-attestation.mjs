import fs from "node:fs";
import {
  loadTokenFeeAuthorityPolicy,
} from "./token-fee-authority-policy.mjs";

const evidencePath =
  "config/mainnet/native-token-attestation.json";
const failures = [];

const SHA256 =
  /^[a-f0-9]{64}$/;
const DIGITS =
  /^(0|[1-9][0-9]*)$/;
const BASE58 =
  /^[1-9A-HJ-NP-Za-km-z]+$/;
const BASE58_ALPHABET =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function decodedBase58Length(
  value,
) {
  if (
    typeof value !==
      "string" ||
    !BASE58.test(
      value,
    )
  ) {
    return -1;
  }

  const bytes = [
    0,
  ];

  for (
    const character of
      value
  ) {
    const digit =
      BASE58_ALPHABET.indexOf(
        character,
      );
    let carry =
      digit;

    for (
      let index =
        0;
      index <
        bytes.length;
      index +=
        1
    ) {
      const current =
        bytes[index] *
          58 +
        carry;
      bytes[index] =
        current &
        0xff;
      carry =
        current >>
        8;
    }

    while (
      carry >
        0
    ) {
      bytes.push(
        carry &
          0xff,
      );
      carry >>=
        8;
    }
  }

  let leadingZeroes =
    0;

  while (
    leadingZeroes <
      value.length &&
    value[
      leadingZeroes
    ] ===
      "1"
  ) {
    leadingZeroes +=
      1;
  }

  const significantLength =
    bytes.length ===
      1 &&
    bytes[0] ===
      0
      ? 0
      : bytes.length;

  return (
    leadingZeroes +
    significantLength
  );
}

function exactPublicKey(
  value,
) {
  return (
    typeof value ===
      "string" &&
    value.length >=
      32 &&
    value.length <=
      44 &&
    decodedBase58Length(
      value,
    ) ===
      32
  );
}

function parseExpectedAuthority(
  value,
  key,
) {
  const normalized =
    value?.trim();

  if (!normalized) {
    failures.push(
      `native-attestation:env:${key}:required`,
    );
    return undefined;
  }

  if (
    normalized ===
      "null"
  ) {
    return null;
  }

  if (
    !exactPublicKey(
      normalized,
    )
  ) {
    failures.push(
      `native-attestation:env:${key}:invalid`,
    );
    return undefined;
  }

  return normalized;
}

function canonicalIso(
  value,
) {
  if (
    typeof value !==
      "string"
  ) {
    return false;
  }

  const parsed =
    Date.parse(
      value,
    );

  return (
    Number.isFinite(
      parsed,
    ) &&
    new Date(
      parsed,
    ).toISOString() ===
      value
  );
}

function parseBoundedEnvInteger(
  key,
  fallback,
  min,
  max,
) {
  const raw =
    process.env[key]
      ?.trim() ||
    String(
      fallback,
    );
  const parsed =
    Number(
      raw,
    );

  if (
    !Number.isSafeInteger(
      parsed,
    ) ||
    parsed <
      min ||
    parsed >
      max
  ) {
    failures.push(
      `native-attestation:env:${key}:invalid`,
    );
    return fallback;
  }

  return parsed;
}

if (
  !fs.existsSync(
    evidencePath,
  )
) {
  failures.push(
    "native-attestation:evidence:missing",
  );
}

let evidence =
  null;

if (
  failures.length ===
    0
) {
  try {
    evidence =
      JSON.parse(
        fs.readFileSync(
          evidencePath,
          "utf8",
        ),
      );
  } catch {
    failures.push(
      "native-attestation:evidence:json-invalid",
    );
  }
}

const expectedGenesisHash =
  process.env
    .PWRC_SOLANA_MAINNET_GENESIS_HASH
    ?.trim();

if (
  !expectedGenesisHash ||
  !exactPublicKey(
    expectedGenesisHash,
  )
) {
  failures.push(
    "native-attestation:env:PWRC_SOLANA_MAINNET_GENESIS_HASH:invalid",
  );
}

const reviewedAuthorityPolicy =
  loadTokenFeeAuthorityPolicy(
    "config/mainnet/token-fee-authorities.json",
    {
      requireConfigured:
        true,
    },
  );

if (
  !reviewedAuthorityPolicy.ok
) {
  for (
    const failure of
      reviewedAuthorityPolicy.failures
  ) {
    failures.push(
      `native-attestation:${failure}`,
    );
  }
}

const expectedTransferFeeConfigAuthority =
  reviewedAuthorityPolicy.policy
    ?.transferFeeConfigAuthority ??
  null;
const expectedWithdrawWithheldAuthority =
  reviewedAuthorityPolicy.policy
    ?.withdrawWithheldAuthority ??
  null;

for (const [envKey, expected] of [
  [
    "PWRC_TRANSFER_FEE_CONFIG_AUTHORITY_EXPECTED",
    expectedTransferFeeConfigAuthority,
  ],
  [
    "PWRC_WITHDRAW_WITHHELD_AUTHORITY_EXPECTED",
    expectedWithdrawWithheldAuthority,
  ],
]) {
  const raw =
    process.env[
      envKey
    ]?.trim();

  if (
    raw
  ) {
    let parsed;

    try {
      parsed =
        parseExpectedAuthority(
          raw,
          envKey,
        );
    } catch {
      failures.push(
        `native-attestation:env:${envKey}:invalid`,
      );
      continue;
    }

    if (
      parsed !==
        expected
    ) {
      failures.push(
        `native-attestation:env:${envKey}:reviewed-policy-mismatch`,
      );
    }
  }
}

const maxAgeMs =
  parseBoundedEnvInteger(
    "PWRC_MAINNET_NATIVE_ATTESTATION_MAX_AGE_MS",
    3_600_000,
    60_000,
    86_400_000,
  );
const maxSlotSkew =
  BigInt(
    parseBoundedEnvInteger(
      "PWRC_NATIVE_VERIFY_MAX_SLOT_SKEW",
      128,
      0,
      100_000,
    ),
  );
const maxIntraSlotSkew =
  BigInt(
    parseBoundedEnvInteger(
      "PWRC_NATIVE_VERIFY_MAX_INTRA_SLOT_SKEW",
      128,
      0,
      100_000,
    ),
  );
const maxEpochSkew =
  BigInt(
    parseBoundedEnvInteger(
      "PWRC_NATIVE_VERIFY_MAX_EPOCH_SKEW",
      1,
      0,
      8,
    ),
  );

if (evidence) {
  if (
    evidence.version !==
      "1.0.0"
  ) {
    failures.push(
      "native-attestation:version",
    );
  }

  if (
    evidence.cluster !==
      "mainnet-beta"
  ) {
    failures.push(
      "native-attestation:cluster",
    );
  }

  if (
    evidence.verified !==
      true
  ) {
    failures.push(
      "native-attestation:verified",
    );
  }

  if (
    evidence.publicWrites !==
      false
  ) {
    failures.push(
      "native-attestation:publicWrites",
    );
  }

  if (
    evidence.mint !==
      "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc"
  ) {
    failures.push(
      "native-attestation:mint",
    );
  }

  if (
    evidence.nativePolicySha256 !==
      "af5fc80addc709e247e3604a698fa2a3efecdd94e148458aceb45cc40ea90f33"
  ) {
    failures.push(
      "native-attestation:native-policy-sha256",
    );
  }

  for (const field of [
    "sourceTreeSha256",
    "consensusSha256",
    "attestationSha256",
  ]) {
    if (
      !SHA256.test(
        evidence[field] ??
          "",
      )
    ) {
      failures.push(
        `native-attestation:${field}`,
      );
    }
  }

  if (
    fs.existsSync(
      "reports/source-tree.sha256",
    ) &&
    SHA256.test(
      evidence.sourceTreeSha256 ??
        "",
    )
  ) {
    const recorded =
      fs.readFileSync(
        "reports/source-tree.sha256",
        "utf8",
      )
      .trim()
      .toLowerCase();

    if (
      recorded !==
        evidence.sourceTreeSha256
          .toLowerCase()
    ) {
      failures.push(
        "native-attestation:source-tree-mismatch",
      );
    }
  }

  if (
    evidence.expectedGenesisHash !==
      expectedGenesisHash
  ) {
    failures.push(
      "native-attestation:genesis-hash-mismatch",
    );
  }

  if (
    evidence.transferFeeAuthorityPolicySha256 !==
      reviewedAuthorityPolicy.policySha256
  ) {
    failures.push(
      "native-attestation:transfer-fee-authority-policy-sha256-mismatch",
    );
  }

  const feePolicy =
    evidence.transferFeeAuthorityPolicy ??
    {};

  if (
    feePolicy.transferFeeConfigAuthority !==
      expectedTransferFeeConfigAuthority
  ) {
    failures.push(
      "native-attestation:transfer-fee-config-authority-mismatch",
    );
  }

  if (
    feePolicy.withdrawWithheldAuthority !==
      expectedWithdrawWithheldAuthority
  ) {
    failures.push(
      "native-attestation:withdraw-withheld-authority-mismatch",
    );
  }

  if (
    !Number.isSafeInteger(
      evidence.observerCount,
    ) ||
    evidence.observerCount <
      2 ||
    evidence.observerCount >
      8
  ) {
    failures.push(
      "native-attestation:observer-count",
    );
  }

  const providerFamilies =
    Array.isArray(
      evidence.providerFamilies,
    )
      ? evidence.providerFamilies
      : [];

  if (
    providerFamilies.length <
      2 ||
    providerFamilies.length !==
      new Set(
        providerFamilies,
      ).size ||
    providerFamilies.some(
      (value) =>
        typeof value !==
          "string" ||
        !value.trim(),
    )
  ) {
    failures.push(
      "native-attestation:provider-family-independence",
    );
  }

  if (
    !providerFamilies.includes(
      "helius",
    )
  ) {
    failures.push(
      "native-attestation:helius-primary-required",
    );
  }

  if (
    !canonicalIso(
      evidence.evaluationAt,
    )
  ) {
    failures.push(
      "native-attestation:evaluationAt",
    );
  } else {
    const age =
      Date.now() -
      Date.parse(
        evidence.evaluationAt,
      );

    if (
      age <
        0 ||
      age >
        maxAgeMs
    ) {
      failures.push(
        "native-attestation:evidence-stale",
      );
    }
  }

  if (
    !canonicalIso(
      evidence.capturedAt,
    )
  ) {
    failures.push(
      "native-attestation:capturedAt",
    );
  }

  const slotRange =
    evidence.slotRange ??
    {};

  if (
    !DIGITS.test(
      slotRange.min ??
        "",
    ) ||
    !DIGITS.test(
      slotRange.max ??
        "",
    ) ||
    !DIGITS.test(
      slotRange.skew ??
        "",
    )
  ) {
    failures.push(
      "native-attestation:slot-range",
    );
  } else {
    const min =
      BigInt(
        slotRange.min,
      );
    const max =
      BigInt(
        slotRange.max,
      );
    const skew =
      BigInt(
        slotRange.skew,
      );

    if (
      max <
        min ||
      max -
        min !==
        skew ||
      skew >
        maxSlotSkew
    ) {
      failures.push(
        "native-attestation:slot-range-inconsistent",
      );
    }
  }

  if (
    !DIGITS.test(
      evidence.epochSkew ??
        "",
    ) ||
    BigInt(
      evidence.epochSkew ??
        "0",
    ) >
      maxEpochSkew
  ) {
    failures.push(
      "native-attestation:epoch-skew",
    );
  }

  const ranges =
    Array.isArray(
      evidence.observationRanges,
    )
      ? evidence.observationRanges
      : [];

  if (
    ranges.length !==
      evidence.observerCount
  ) {
    failures.push(
      "native-attestation:observation-range-count",
    );
  }

  const observerNames =
    new Set();

  for (const range of ranges) {
    const observer =
      range?.observer;

    if (
      typeof observer !==
        "string" ||
      !observer.trim() ||
      observerNames.has(
        observer,
      )
    ) {
      failures.push(
        "native-attestation:observer-name",
      );
      continue;
    }

    observerNames.add(
      observer,
    );

    if (
      !DIGITS.test(
        range.slotStart ??
          "",
      ) ||
      !DIGITS.test(
        range.slotEnd ??
          "",
      ) ||
      !DIGITS.test(
        range.slotSpan ??
          "",
      )
    ) {
      failures.push(
        `native-attestation:observation-range:${observer}`,
      );
      continue;
    }

    const start =
      BigInt(
        range.slotStart,
      );
    const end =
      BigInt(
        range.slotEnd,
      );
    const span =
      BigInt(
        range.slotSpan,
      );

    if (
      end <
        start ||
      end -
        start !==
        span ||
      span >
        maxIntraSlotSkew
    ) {
      failures.push(
        `native-attestation:observation-range-inconsistent:${observer}`,
      );
    }
  }
}

const result = {
  ok:
    failures.length ===
    0,
  version:
    "1.0.0",
  evidencePath,
  canonicalMint:
    "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc",
  nativePolicySha256:
    "af5fc80addc709e247e3604a698fa2a3efecdd94e148458aceb45cc40ea90f33",
  minimumObservers:
    2,
  providerIndependence:
    true,
  sourceTreeBound:
    true,
  feeAuthorityPolicyBound:
    true,
  feeAuthorityPolicyCommitment:
    reviewedAuthorityPolicy.policySha256,
  freshnessBound:
    true,
  publicWrites:
    false,
  failures,
};

fs.mkdirSync(
  "reports",
  {
    recursive:
      true,
  },
);

fs.writeFileSync(
  "reports/mainnet-native-token-attestation-verification.json",
  `${JSON.stringify(result, null, 2)}\n`,
);

console.log(
  JSON.stringify(
    result,
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(2);
}

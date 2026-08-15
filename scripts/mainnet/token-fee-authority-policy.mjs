import fs from "node:fs";
import crypto from "node:crypto";

export const TOKEN_FEE_AUTHORITY_POLICY_DOMAIN =
  "POWERCHAIN_MAINNET_TRANSFER_FEE_AUTHORITY_POLICY_V1";

export const TOKEN_FEE_AUTHORITY_POLICY_PATH =
  "config/mainnet/token-fee-authorities.json";

const CANONICAL_MINT =
  "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc";

const BASE58_ALPHABET =
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function decodedBase58Length(
  value,
) {
  if (
    !/^[1-9A-HJ-NP-Za-km-z]+$/.test(
      value,
    )
  ) {
    return -1;
  }

  const bytes = [
    0,
  ];

  for (const character of value) {
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

export function tokenFeeAuthorityPolicySha256(
  policy,
) {
  return crypto
    .createHash(
      "sha256",
    )
    .update(
      canonicalJson({
        domain:
          TOKEN_FEE_AUTHORITY_POLICY_DOMAIN,
        policy,
      }),
    )
    .digest(
      "hex",
    );
}

function validNullableAuthority(
  value,
) {
  return (
    value ===
      null ||
    exactPublicKey(
      value,
    )
  );
}

function validIso(
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

export function verifyTokenFeeAuthorityPolicyDocument(
  document,
  {
    requireConfigured =
      true,
  } = {},
) {
  const failures = [];

  if (
    !document ||
    typeof document !==
      "object" ||
    Array.isArray(
      document,
    )
  ) {
    return {
      ok:
        false,
      failures: [
        "token-fee-authority-policy:document-invalid",
      ],
      policy:
        null,
      policySha256:
        null,
    };
  }

  const {
    policySha256,
    ...policy
  } =
    document;

  const allowedKeys =
    new Set([
      "version",
      "cluster",
      "mint",
      "configured",
      "transferFeeConfigAuthority",
      "withdrawWithheldAuthority",
      "reviewedAt",
      "reviewReference",
      "policySha256",
    ]);

  for (const key of Object.keys(document)) {
    if (
      !allowedKeys.has(
        key,
      )
    ) {
      failures.push(
        `token-fee-authority-policy:unexpected-field:${key}`,
      );
    }
  }

  if (
    policy.version !==
      "1.0.0"
  ) {
    failures.push(
      "token-fee-authority-policy:version",
    );
  }

  if (
    policy.cluster !==
      "mainnet-beta"
  ) {
    failures.push(
      "token-fee-authority-policy:cluster",
    );
  }

  if (
    policy.mint !==
      CANONICAL_MINT
  ) {
    failures.push(
      "token-fee-authority-policy:mint",
    );
  }

  if (
    typeof policy.configured !==
      "boolean"
  ) {
    failures.push(
      "token-fee-authority-policy:configured-type",
    );
  }

  if (
    requireConfigured &&
    policy.configured !==
      true
  ) {
    failures.push(
      "token-fee-authority-policy:not-configured",
    );
  }

  if (
    !validNullableAuthority(
      policy.transferFeeConfigAuthority,
    )
  ) {
    failures.push(
      "token-fee-authority-policy:transfer-fee-config-authority",
    );
  }

  if (
    !validNullableAuthority(
      policy.withdrawWithheldAuthority,
    )
  ) {
    failures.push(
      "token-fee-authority-policy:withdraw-withheld-authority",
    );
  }

  if (
    policy.configured ===
      true
  ) {
    if (
      !validIso(
        policy.reviewedAt,
      )
    ) {
      failures.push(
        "token-fee-authority-policy:reviewed-at",
      );
    }

    if (
      typeof policy.reviewReference !==
        "string" ||
      policy.reviewReference.trim().length <
        1 ||
      policy.reviewReference.length >
        256
    ) {
      failures.push(
        "token-fee-authority-policy:review-reference",
      );
    }
  } else if (
    policy.reviewedAt !==
      null ||
    policy.reviewReference !==
      null
  ) {
    failures.push(
      "token-fee-authority-policy:unconfigured-review-fields",
    );
  }

  const expectedSha =
    tokenFeeAuthorityPolicySha256(
      policy,
    );

  if (
    typeof policySha256 !==
      "string" ||
    !/^[a-f0-9]{64}$/.test(
      policySha256,
    ) ||
    policySha256 !==
      expectedSha
  ) {
    failures.push(
      "token-fee-authority-policy:commitment",
    );
  }

  return {
    ok:
      failures.length ===
      0,
    failures,
    policy,
    policySha256:
      typeof policySha256 ===
        "string"
        ? policySha256
        : null,
  };
}

export function loadTokenFeeAuthorityPolicy(
  path =
    TOKEN_FEE_AUTHORITY_POLICY_PATH,
  options,
) {
  if (
    !fs.existsSync(
      path,
    )
  ) {
    return {
      ok:
        false,
      failures: [
        "token-fee-authority-policy:file-missing",
      ],
      policy:
        null,
      policySha256:
        null,
      path,
    };
  }

  let document;

  try {
    document =
      JSON.parse(
        fs.readFileSync(
          path,
          "utf8",
        ),
      );
  } catch {
    return {
      ok:
        false,
      failures: [
        "token-fee-authority-policy:json-invalid",
      ],
      policy:
        null,
      policySha256:
        null,
      path,
    };
  }

  return {
    ...verifyTokenFeeAuthorityPolicyDocument(
      document,
      options,
    ),
    path,
  };
}

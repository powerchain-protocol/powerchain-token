import {
  PWRC_DECIMALS,
  PWRC_GENESIS_BASE_UNITS,
  PWRC_SCALE,
} from "./constants.js";

const DECIMAL_PATTERN =
  /^(0|[1-9][0-9]*)(?:\.([0-9]+))?$/;

export function parsePwrcTokensToBaseUnits(
  value:
    string,
): bigint {
  const normalized =
    value.trim();
  const match =
    DECIMAL_PATTERN.exec(
      normalized,
    );

  if (!match) {
    throw new Error(
      "PWRC_AMOUNT_FORMAT_INVALID",
    );
  }

  const whole =
    BigInt(
      match[1],
    );
  const fraction =
    match[2] ??
    "";

  if (
    fraction.length >
      PWRC_DECIMALS
  ) {
    throw new Error(
      "PWRC_AMOUNT_PRECISION_EXCEEDED",
    );
  }

  const fractionalBaseUnits =
    BigInt(
      (
        fraction +
        "0".repeat(
          PWRC_DECIMALS -
          fraction.length,
        )
      ) ||
      "0",
    );

  const baseUnits =
    whole *
      PWRC_SCALE +
    fractionalBaseUnits;

  if (
    baseUnits >
      PWRC_GENESIS_BASE_UNITS
  ) {
    throw new Error(
      "PWRC_AMOUNT_EXCEEDS_SUPPLY",
    );
  }

  return baseUnits;
}

export function formatPwrcBaseUnits(
  baseUnits:
    bigint,
): string {
  if (
    baseUnits <
      0n ||
    baseUnits >
      PWRC_GENESIS_BASE_UNITS
  ) {
    throw new Error(
      "PWRC_BASE_UNITS_INVALID",
    );
  }

  const whole =
    baseUnits /
    PWRC_SCALE;
  const fraction =
    (
      baseUnits %
      PWRC_SCALE
    )
      .toString()
      .padStart(
        PWRC_DECIMALS,
        "0",
      )
      .replace(
        /0+$/,
        "",
      );

  return fraction
    ? `${whole}.${fraction}`
    : whole.toString();
}

export function assertCanonicalPwrcBaseUnitsString(
  value:
    string,
): bigint {
  if (
    !/^(0|[1-9][0-9]*)$/.test(
      value,
    )
  ) {
    throw new Error(
      "PWRC_BASE_UNITS_ENCODING_INVALID",
    );
  }

  const baseUnits =
    BigInt(
      value,
    );

  if (
    baseUnits >
      PWRC_GENESIS_BASE_UNITS
  ) {
    throw new Error(
      "PWRC_AMOUNT_EXCEEDS_SUPPLY",
    );
  }

  return baseUnits;
}


export function assertPositivePwrcBaseUnitsString(
  value:
    string,
): bigint {
  const baseUnits =
    assertCanonicalPwrcBaseUnitsString(
      value,
    );

  if (baseUnits === 0n) {
    throw new Error(
      "PWRC_AMOUNT_MUST_BE_POSITIVE",
    );
  }

  return baseUnits;
}

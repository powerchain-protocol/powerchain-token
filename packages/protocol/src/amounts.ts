import { PWRC_SCALE } from "./constants.js";

export function parsePwrcAmount(value: string): bigint {
  const match = /^([0-9]+)(?:\.([0-9]{0,9}))?$/.exec(value.trim());
  if (!match) throw new Error("PWRC_AMOUNT_INVALID");
  const whole = BigInt(match[1] ?? "0");
  const fraction = (match[2] ?? "").padEnd(9, "0");
  return whole * PWRC_SCALE + BigInt(fraction || "0");
}

export function formatPwrcAmount(baseUnits: bigint): string {
  if (baseUnits < 0n) throw new Error("PWRC_AMOUNT_NEGATIVE");
  const whole = baseUnits / PWRC_SCALE;
  const fraction = (baseUnits % PWRC_SCALE)
    .toString()
    .padStart(9, "0")
    .replace(/0+$/, "");
  return fraction ? `${whole}.${fraction}` : whole.toString();
}

export const NODE_COMPAT =
  "22.22.3";
export const NODE_24 =
  "24.18.1";
export const NODE_26 =
  "26.5.1";
export const PNPM_VERSION =
  "10.21.0";

function tuple(value) {
  const match =
    String(value)
      .replace(/^v/, "")
      .match(/^(\d+)\.(\d+)\.(\d+)/);

  if (!match) {
    return null;
  }

  return match
    .slice(1)
    .map(Number);
}

function atLeast(
  value,
  minimum,
) {
  const left = tuple(value);
  const right = tuple(minimum);

  if (!left || !right) {
    return false;
  }

  for (let index = 0; index < 3; index += 1) {
    if (left[index] > right[index]) {
      return true;
    }
    if (left[index] < right[index]) {
      return false;
    }
  }

  return true;
}

export function isSupportedNode(
  value,
) {
  const parsed = tuple(value);

  if (!parsed) {
    return false;
  }

  const major = parsed[0];

  if (major === 22) {
    return atLeast(
      value,
      NODE_COMPAT,
    );
  }

  if (major === 24) {
    return atLeast(
      value,
      NODE_24,
    );
  }

  if (major === 26) {
    return atLeast(
      value,
      NODE_26,
    );
  }

  return false;
}

export function nodePolicyLabel() {
  return [
    `>=${NODE_COMPAT} <23`,
    `>=${NODE_24} <25`,
    `>=${NODE_26} <27`,
  ].join(" || ");
}

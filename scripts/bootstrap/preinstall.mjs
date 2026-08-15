const requiredNode =
  {
    major:
      26,
    minor:
      5,
    patch:
      1,
  };
const requiredPnpm =
  "11.18.0";

function parseNode(
  value,
) {
  const match =
    /^v?(\d+)\.(\d+)\.(\d+)/.exec(
      value,
    );

  return match
    ? {
        major:
          Number(match[1]),
        minor:
          Number(match[2]),
        patch:
          Number(match[3]),
      }
    : null;
}

function nodeSupported(
  actual,
) {
  if (
    !actual ||
    actual.major !==
      requiredNode.major
  ) {
    return false;
  }

  if (
    actual.minor >
      requiredNode.minor
  ) {
    return true;
  }

  if (
    actual.minor <
      requiredNode.minor
  ) {
    return false;
  }

  return (
    actual.patch >=
    requiredNode.patch
  );
}

const actualNode =
  parseNode(
    process.version,
  );

if (
  !nodeSupported(
    actualNode,
  )
) {
  console.error(
    `PWRC_TOOLCHAIN_NODE_UNSUPPORTED: expected >=26.5.1 <27, got ${process.version}`,
  );
  process.exit(1);
}

const userAgent =
  process.env
    .npm_config_user_agent ??
  "";

const pnpmMatch =
  /(?:^|\s)pnpm\/([^\s]+)/.exec(
    userAgent,
  );

if (
  !pnpmMatch
) {
  console.error(
    "PWRC_TOOLCHAIN_PNPM_REQUIRED: install with pnpm@11.18.0; npm/yarn installs are not supported for this workspace.",
  );
  process.exit(1);
}

if (
  pnpmMatch[1] !==
    requiredPnpm
) {
  console.error(
    `PWRC_TOOLCHAIN_PNPM_VERSION_MISMATCH: expected ${requiredPnpm}, got ${pnpmMatch[1]}`,
  );
  process.exit(1);
}

console.log(
  JSON.stringify({
    ok:
      true,
    version:
      "1.0.0",
    node:
      process.version,
    pnpm:
      pnpmMatch[1],
  }),
);

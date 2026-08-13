import fs from "node:fs";
import path from "node:path";

const failures = [];
const observed = [];

const pnpmRoot =
  "node_modules/.pnpm";

if (
  !fs.existsSync(
    pnpmRoot,
  )
) {
  console.error(
    "PWRC_DEPENDENCY_TREE_NOT_INSTALLED: run pnpm install first",
  );
  process.exit(2);
}

function parseVersion(
  value,
) {
  const match =
    /^(\d+)\.(\d+)\.(\d+)/.exec(
      value,
    );

  if (!match) {
    return null;
  }

  return match
    .slice(1)
    .map(Number);
}

function compare(
  left,
  right,
) {
  for (
    let index = 0;
    index < 3;
    index += 1
  ) {
    if (
      left[index] !==
      right[index]
    ) {
      return (
        left[index] -
        right[index]
      );
    }
  }

  return 0;
}

function uuidVulnerable(
  version,
) {
  const parsed =
    parseVersion(version);

  if (!parsed) {
    return true;
  }

  const major =
    parsed[0];

  if (major < 11) {
    return true;
  }

  if (
    major === 11
  ) {
    return (
      compare(
        parsed,
        [11, 1, 1],
      ) < 0
    );
  }

  if (
    major === 12
  ) {
    return (
      compare(
        parsed,
        [12, 0, 1],
      ) < 0
    );
  }

  if (
    major === 13
  ) {
    return (
      compare(
        parsed,
        [13, 0, 1],
      ) < 0
    );
  }

  return false;
}

for (
  const entry of
  fs.readdirSync(
    pnpmRoot,
    {
      withFileTypes:
        true,
    },
  )
) {
  if (!entry.isDirectory()) {
    continue;
  }

  const packageRoot =
    path.join(
      pnpmRoot,
      entry.name,
      "node_modules",
    );

  for (const name of [
    "uuid",
    "bigint-buffer",
  ]) {
    const packageJson =
      path.join(
        packageRoot,
        name,
        "package.json",
      );

    if (
      !fs.existsSync(
        packageJson,
      )
    ) {
      continue;
    }

    const pkg =
      JSON.parse(
        fs.readFileSync(
          packageJson,
          "utf8",
        ),
      );

    observed.push({
      name:
        pkg.name,
      version:
        pkg.version,
      safeShim:
        pkg.powerchainSafeShim ===
          true,
    });

    if (
      name === "uuid" &&
      uuidVulnerable(
        pkg.version,
      )
    ) {
      failures.push(
        `vulnerable-uuid:${pkg.version}`,
      );
    }

    if (
      name ===
        "bigint-buffer" &&
      pkg.powerchainSafeShim !==
        true
    ) {
      failures.push(
        `vulnerable-upstream-bigint-buffer:${pkg.version}`,
      );
    }
  }
}

console.log(
  JSON.stringify(
    {
      ok:
        failures.length === 0,
      version:
        "1.0.0",
      observed,
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}

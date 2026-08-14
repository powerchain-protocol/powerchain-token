import fs from "node:fs";
import path from "node:path";

const failures = [];
const packageDirs =
  fs.readdirSync(
    "packages",
    {
      withFileTypes:
        true,
    },
  )
  .filter(
    (entry) =>
      entry.isDirectory(),
  )
  .map(
    (entry) =>
      entry.name,
  );

for (const packageName of packageDirs) {
  const sourceRoot =
    path.join(
      "packages",
      packageName,
      "src",
    );

  if (!fs.existsSync(sourceRoot)) {
    continue;
  }

  for (const file of walk(sourceRoot)) {
    if (
      !/\.(?:ts|tsx|mts|cts|js|mjs)$/.test(
        file,
      )
    ) {
      continue;
    }

    const source =
      fs.readFileSync(
        file,
        "utf8",
      );

    const crossPackageRelative =
      /(?:from\s+|import\s*\()\s*["'](?:\.\.\/){2,}([^"']+)["']/g;

    for (
      const match of
      source.matchAll(
        crossPackageRelative,
      )
    ) {
      const target =
        match[0];

      if (
        target.includes(
          "/protocol/src/",
        ) ||
        target.includes(
          "/sdk/src/",
        ) ||
        target.includes(
          "/metaplex/src/",
        ) ||
        target.includes(
          "/runtime/src/",
        ) ||
        target.includes(
          "/bridge-integration/src/",
        ) ||
        target.includes(
          "/native-token-client/src/",
        )
      ) {
        failures.push(
          `workspace-boundary:${file}:${target}`,
        );
      }
    }
  }
}

function walk(
  directory,
) {
  const files = [];

  for (
    const entry of
    fs.readdirSync(
      directory,
      {
        withFileTypes:
          true,
      },
    )
  ) {
    const target =
      path.join(
        directory,
        entry.name,
      );

    if (entry.isDirectory()) {
      files.push(
        ...walk(target),
      );
    } else {
      files.push(target);
    }
  }

  return files;
}

const result = {
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  packages:
    packageDirs.length,
  crossPackageRelativeImports:
    failures.length,
  failures,
};

console.log(
  JSON.stringify(
    result,
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}

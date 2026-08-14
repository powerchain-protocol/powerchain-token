import fs from "node:fs";
import path from "node:path";

const failures = [];

for (const base of [
  "packages",
  "apps",
]) {
  if (!fs.existsSync(base)) {
    continue;
  }

  for (
    const entry of
    fs.readdirSync(
      base,
      {
        withFileTypes:
          true,
      },
    )
  ) {
    if (!entry.isDirectory()) {
      continue;
    }

    const packageFile =
      path.join(
        base,
        entry.name,
        "package.json",
      );

    if (!fs.existsSync(packageFile)) {
      continue;
    }

    const pkg =
      JSON.parse(
        fs.readFileSync(
          packageFile,
          "utf8",
        ),
      );

    for (
      const [
        subpath,
        target,
      ] of
      Object.entries(
        pkg.exports ??
        {},
      )
    ) {
      if (
        typeof target !==
          "string" ||
        !target.startsWith(
          "./",
        )
      ) {
        failures.push(
          `exports:invalid:${pkg.name}:${subpath}`,
        );
        continue;
      }

      const resolved =
        path.join(
          base,
          entry.name,
          target,
        );

      if (!fs.existsSync(resolved)) {
        failures.push(
          `exports:missing-target:${pkg.name}:${subpath}:${target}`,
        );
      }
    }

    for (
      const [
        dependency,
        version,
      ] of
      Object.entries(
        pkg.dependencies ??
        {},
      )
    ) {
      if (
        dependency.startsWith(
          "@powerchain/",
        ) &&
        version !==
          "workspace:*"
      ) {
        failures.push(
          `workspace-version:${pkg.name}:${dependency}:${version}`,
        );
      }
    }
  }
}

const result = {
  ok:
    failures.length === 0,
  version:
    "1.0.0",
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

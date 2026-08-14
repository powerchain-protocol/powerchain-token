import fs from "node:fs";
import path from "node:path";

const failures = [];

const expectedApps = [
  "api",
  "client",
  "docs",
];

for (const app of expectedApps) {
  const packageFile =
    path.join(
      "apps",
      app,
      "package.json",
    );

  if (!fs.existsSync(packageFile)) {
    failures.push(
      `missing-app:${app}`,
    );
  }
}

for (const stale of [
  "src",
  "utils",
]) {
  if (
    fs.existsSync(stale) &&
    fs.statSync(stale)
      .isDirectory()
  ) {
    failures.push(
      `stale-root-source:${stale}`,
    );
  }
}

const workspace =
  fs.readFileSync(
    "pnpm-workspace.yaml",
    "utf8",
  );

for (const pattern of [
  'apps/*',
  'packages/*',
]) {
  if (!workspace.includes(pattern)) {
    failures.push(
      `workspace-pattern:${pattern}`,
    );
  }
}

const packageNames =
  new Set();

for (const base of [
  "apps",
  "packages",
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

    if (!pkg.name) {
      failures.push(
        `package-name-missing:${base}/${entry.name}`,
      );
      continue;
    }

    if (packageNames.has(pkg.name)) {
      failures.push(
        `duplicate-package-name:${pkg.name}`,
      );
    }

    packageNames.add(pkg.name);
  }
}

const result = {
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  apps:
    expectedApps.length,
  packages:
    [...packageNames]
      .filter(
        (name) =>
          name.startsWith(
            "@powerchain/",
          ),
      )
      .length,
  rootSourceDirectoriesRemoved:
    !fs.existsSync("src") &&
    !fs.existsSync("utils"),
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

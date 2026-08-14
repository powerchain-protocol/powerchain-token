import fs from "node:fs";
import path from "node:path";

const failures = [];
const packages =
  new Map();

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

    const file =
      path.join(
        base,
        entry.name,
        "package.json",
      );

    if (!fs.existsSync(file)) {
      continue;
    }

    const pkg =
      JSON.parse(
        fs.readFileSync(
          file,
          "utf8",
        ),
      );

    if (!pkg.name) {
      failures.push(
        `workspace-graph:missing-name:${file}`,
      );
      continue;
    }

    packages.set(
      pkg.name,
      {
        file,
        pkg,
      },
    );
  }
}

const graph =
  new Map();

for (const [
  name,
  {
    pkg,
  },
] of packages) {
  const deps =
    new Set();

  for (const group of [
    pkg.dependencies,
    pkg.devDependencies,
    pkg.peerDependencies,
  ]) {
    for (const dependency of Object.keys(group ?? {})) {
      if (
        dependency.startsWith(
          "@powerchain/",
        )
      ) {
        if (!packages.has(dependency)) {
          failures.push(
            `workspace-graph:missing-package:${name}:${dependency}`,
          );
        } else {
          deps.add(
            dependency,
          );
        }
      }
    }
  }

  graph.set(
    name,
    deps,
  );
}

const temporary =
  new Set();
const permanent =
  new Set();

function visit(
  name,
  trail,
) {
  if (permanent.has(name)) {
    return;
  }

  if (temporary.has(name)) {
    failures.push(
      `workspace-graph:cycle:${[
        ...trail,
        name,
      ].join("->")}`,
    );
    return;
  }

  temporary.add(name);

  for (const next of graph.get(name) ?? []) {
    visit(
      next,
      [
        ...trail,
        name,
      ],
    );
  }

  temporary.delete(name);
  permanent.add(name);
}

for (const name of graph.keys()) {
  visit(
    name,
    [],
  );
}

console.log(
  JSON.stringify(
    {
      ok:
        failures.length === 0,
      version:
        "1.0.0",
      workspaces:
        packages.size,
      edges:
        [...graph.values()]
          .reduce(
            (
              total,
              deps,
            ) =>
              total +
              deps.size,
            0,
          ),
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}

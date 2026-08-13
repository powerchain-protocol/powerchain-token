import fs from "node:fs";
import path from "node:path";
import { atomicWriteJsonSync } from "../lib/atomic-json.mjs";

const rootTargets = [
  ".next",
  ".turbo",
  ".cache",
  "dist",
  "coverage",
  "target",
  "node_modules/.cache",
  "node_modules/.pnpm-debug.log",
];

const workspaceRoots = [
  "packages",
  "apps",
  "services",
];

const workspaceTargetNames =
  new Set([
    ".next",
    ".turbo",
    ".cache",
    "dist",
    "coverage",
  ]);

const candidates =
  new Set(rootTargets);

for (
  const workspaceRoot of
  workspaceRoots
) {
  if (
    !fs.existsSync(
      workspaceRoot,
    )
  ) {
    continue;
  }

  for (
    const entry of
    fs.readdirSync(
      workspaceRoot,
      {
        withFileTypes: true,
      },
    )
  ) {
    if (!entry.isDirectory()) {
      continue;
    }

    const packageRoot =
      path.join(
        workspaceRoot,
        entry.name,
      );

    for (
      const target of
      workspaceTargetNames
    ) {
      candidates.add(
        path.join(
          packageRoot,
          target,
        ),
      );
    }
  }
}

const removed = [];

for (
  const target of
  [...candidates].sort()
) {
  if (
    !fs.existsSync(target)
  ) {
    continue;
  }

  fs.rmSync(
    target,
    {
      recursive: true,
      force: true,
    },
  );

  removed.push(target);
}

const report = {
  ok: true,
  version: "1.0.0",
  removed,
  protected: [
    "node_modules",
    "pnpm store",
    "deployment evidence",
    "release artifacts",
  ],
  note:
    "Only repository-local build/cache outputs are removed.",
};

atomicWriteJsonSync(
  "reports/cache-clean.json",
  report,
);

console.log(
  JSON.stringify(
    report,
    null,
    2,
  ),
);

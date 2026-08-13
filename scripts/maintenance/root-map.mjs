import fs from "node:fs";
import {
  atomicWriteJsonSync,
} from "../../packages/runtime/src/atomic-json.mjs";

const entries =
  fs.readdirSync(
    ".",
    {
      withFileTypes: true,
    },
  )
    .filter(
      (entry) =>
        ![
          ".git",
          "node_modules",
        ].includes(
          entry.name,
        ),
    )
    .map(
      (entry) => ({
        name:
          entry.name,
        type:
          entry.isDirectory()
            ? "directory"
            : "file",
      }),
    )
    .sort(
      (a, b) =>
        a.name.localeCompare(
          b.name,
        ),
    );

const report = {
  ok: true,
  version: "1.0.0",
  generatedAt:
    new Date()
      .toISOString(),
  canonicalLayers: {
    runtime:
      "packages/protocol/src/common/",
    typedUtilities:
      "packages/protocol/src/utils/",
    nodeUtilities:
      "packages/runtime/src/",
    configuration:
      "config/",
    contracts:
      "contracts/",
    programs:
      "programs/",
    clients:
      "packages/sdk/src/",
    releaseTooling:
      "scripts/",
    evidence:
      "reports/ and deployments/",
  },
  entries,
};

atomicWriteJsonSync(
  "reports/root-map.json",
  report,
);

console.log(
  JSON.stringify(
    report,
    null,
    2,
  ),
);

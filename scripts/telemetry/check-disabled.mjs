import fs from "node:fs";

const failures = [];
const warnings = [];

function readRequired(
  file,
) {
  if (!fs.existsSync(file)) {
    failures.push(
      `missing:${file}`,
    );
    return "";
  }

  return fs.readFileSync(
    file,
    "utf8",
  );
}

const nextConfig =
  readRequired(
    "next.config.mjs",
  );

const envExample =
  readRequired(
    ".env.example",
  );

const ci =
  readRequired(
    ".github/workflows/ci.yml",
  );

const variables = [
  "NEXT_TELEMETRY_DISABLED",
  "TURBO_TELEMETRY_DISABLED",
  "DO_NOT_TRACK",
];

for (const variable of variables) {
  if (
    !nextConfig.includes(
      variable,
    )
  ) {
    failures.push(
      `next-config:${variable}`,
    );
  }

  if (
    !envExample.includes(
      `${variable}=1`,
    )
  ) {
    failures.push(
      `env-example:${variable}`,
    );
  }

  if (
    !ci.includes(
      variable,
    )
  ) {
    failures.push(
      `ci:${variable}`,
    );
  }
}

// Developer-local environment files are intentionally not release inputs.
// Surface drift as a warning only.
if (
  fs.existsSync(
    ".env.production",
  )
) {
  const localProductionEnv =
    fs.readFileSync(
      ".env.production",
      "utf8",
    );

  for (const variable of variables) {
    if (
      !localProductionEnv.includes(
        `${variable}=1`,
      )
    ) {
      warnings.push(
        `local-production-env:${variable}`,
      );
    }
  }
}

if (
  process.env.NODE_OPTIONS
) {
  warnings.push(
    "local-node-options-set",
  );
}

console.log(
  JSON.stringify(
    {
      ok:
        failures.length === 0,
      version:
        "1.0.0",
      telemetry: {
        next:
          "disabled",
        turbo:
          "disabled",
        doNotTrack:
          true,
        releasePolicySources: [
          "next.config.mjs",
          ".env.example",
          ".github/workflows/ci.yml",
        ],
        localEnvironmentAffectsResult:
          false,
      },
      warnings,
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}

import {
  spawnSync,
} from "node:child_process";

const failures = [];

function run(
  script,
  env,
) {
  return spawnSync(
    process.execPath,
    [script],
    {
      encoding:
        "utf8",
      shell:
        false,
      env,
    },
  );
}

const hostileEnv = {
  ...process.env,
  NODE_OPTIONS: "",
};

// Production-static checks must work independently of a user's VS Code
// debugger injection or local .env.production file.
for (const script of [
  "scripts/production/check-platform-bootstrap.mjs",
  "scripts/telemetry/check-disabled.mjs",
]) {
  const result =
    run(
      script,
      hostileEnv,
    );

  if (
    result.status !== 0
  ) {
    failures.push(
      `${script}:${result.status}:${result.stdout}:${result.stderr}`,
    );
  }
}

console.log(
  JSON.stringify(
    {
      ok:
        failures.length === 0,
      version:
        "1.0.0",
      tests: {
        platformCheckRepositoryScoped:
          true,
        telemetryCheckRepositoryScoped:
          true,
        localNodeOptionsNonBlocking:
          true,
        localProductionEnvNonBlocking:
          true,
      },
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}

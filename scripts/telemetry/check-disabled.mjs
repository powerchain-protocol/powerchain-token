import fs from "node:fs";

const failures = [];

const nextConfig = fs.readFileSync(
  "next.config.mjs",
  "utf8",
);

const productionEnv = fs.readFileSync(
  ".env.production",
  "utf8",
);

for (const variable of [
  "NEXT_TELEMETRY_DISABLED",
  "TURBO_TELEMETRY_DISABLED",
  "DO_NOT_TRACK",
]) {
  if (!nextConfig.includes(variable)) {
    failures.push(
      `next-config:${variable}`,
    );
  }

  if (
    !productionEnv.includes(
      `${variable}=1`,
    )
  ) {
    failures.push(
      `production-env:${variable}`,
    );
  }
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  telemetry: {
    next: "disabled",
    turbo: "disabled",
    doNotTrack: true,
  },
  failures,
}, null, 2));

if (failures.length) process.exit(1);

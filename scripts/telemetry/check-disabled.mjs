import fs from "node:fs";

const failures = [];

for (const file of [
  ".env.example",
  ".env.production",
]) {
  if (!fs.existsSync(file)) {
    failures.push(
      `missing:${file}`,
    );
    continue;
  }

  const source =
    fs.readFileSync(
      file,
      "utf8",
    );

  for (const invariant of [
    "NEXT_TELEMETRY_DISABLED=1",
    "TURBO_TELEMETRY_DISABLED=1",
    "DO_NOT_TRACK=1",
  ]) {
    if (!source.includes(invariant)) {
      failures.push(
        `${file}:${invariant}`,
      );
    }
  }
}

const result = {
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  nextTelemetryDisabled:
    true,
  turboTelemetryDisabled:
    true,
  doNotTrack:
    true,
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

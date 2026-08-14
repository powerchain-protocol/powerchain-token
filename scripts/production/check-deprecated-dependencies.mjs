import fs from "node:fs";

const failures = [];

const root =
  JSON.parse(
    fs.readFileSync(
      "package.json",
      "utf8",
    ),
  );

const override =
  root.pnpm
    ?.overrides
    ?.[
      "uuid@8.3.2"
    ];

if (
  override !==
    "11.1.1"
) {
  failures.push(
    `dependency-hygiene:uuid-override:${String(override)}`,
  );
}

for (const file of [
  "package.json",
  "pnpm-workspace.yaml",
]) {
  const source =
    fs.readFileSync(
      file,
      "utf8",
    );

  if (
    file ===
      "package.json" &&
    /"uuid"\s*:\s*"8\.3\.2"/.test(
      source,
    )
  ) {
    failures.push(
      "dependency-hygiene:direct-uuid-8.3.2",
    );
  }
}

if (
  fs.existsSync(
    "pnpm-lock.yaml",
  )
) {
  const lock =
    fs.readFileSync(
      "pnpm-lock.yaml",
      "utf8",
    );

  if (
    /(?:^|\n)\s{2,}uuid@8\.3\.2(?=:|\()/m.test(
      lock,
    ) ||
    /version:\s*8\.3\.2(?:\s|$)/m.test(
      lock,
    )
  ) {
    failures.push(
      "dependency-hygiene:lockfile-resolves-uuid-8.3.2",
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
      deprecated:
        "uuid@8.3.2",
      override:
        "uuid@11.1.1",
      rationale:
        "uuid 11 remains CommonJS-compatible; uuid 12+ removes CommonJS support",
      lockfileChecked:
        fs.existsSync(
          "pnpm-lock.yaml",
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

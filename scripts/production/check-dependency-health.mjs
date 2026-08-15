import fs from "node:fs";

const failures = [];
const pkg =
  JSON.parse(
    fs.readFileSync(
      "package.json",
      "utf8",
    ),
  );
const workspace =
  fs.readFileSync(
    "pnpm-workspace.yaml",
    "utf8",
  );
const example =
  fs.readFileSync(
    ".env.example",
    "utf8",
  );

if (
  pkg.pnpm?.overrides?.uuid !==
    "11.1.1"
) {
  failures.push(
    "dependency-health:uuid-override",
  );
}

if (
  pkg.pnpm?.overrides?.[
    "utf-8-validate"
  ] !== "5.0.10"
) {
  failures.push(
    "dependency-health:utf8-override",
  );
}

if (
  !workspace.includes(
    '  - "utf-8-validate"',
  )
) {
  failures.push(
    "dependency-health:utf8-build-not-ignored",
  );
}

if (
  !example.includes(
    "WS_NO_UTF_8_VALIDATE=1",
  )
) {
  failures.push(
    "dependency-health:ws-native-utf8-not-disabled",
  );
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
    /utf-8-validate@6\.0\.6/.test(
      lock,
    )
  ) {
    failures.push(
      "dependency-health:lockfile-stale-utf8-6.0.6",
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
      uuid:
        "11.1.1",
      utf8ValidatePeer:
        "5.0.10",
      utf8NativeAddonRuntime:
        "disabled",
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}

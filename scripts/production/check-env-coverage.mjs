import fs from "node:fs";
import path from "node:path";

const failures = [];

function walk(
  directory,
) {
  const output = [];

  for (
    const entry of
    fs.readdirSync(
      directory,
      {
        withFileTypes:
          true,
      },
    )
  ) {
    if (
      [
        "node_modules",
        "target",
        "reports",
        ".git",
      ].includes(
        entry.name,
      )
    ) {
      continue;
    }

    const target =
      path.join(
        directory,
        entry.name,
      );

    if (entry.isDirectory()) {
      output.push(
        ...walk(target),
      );
    } else {
      output.push(target);
    }
  }

  return output;
}

const runtimeKeys =
  new Set();

for (const file of walk(".")) {
  if (
    !/\.(?:mjs|js|ts|tsx|cts|mts)$/.test(
      file,
    )
  ) {
    continue;
  }

  const source =
    fs.readFileSync(
      file,
      "utf8",
    );

  for (
    const match of
    source.matchAll(
      /process\.env\.([A-Z][A-Z0-9_]*)/g,
    )
  ) {
    runtimeKeys.add(
      match[1],
    );
  }

  for (
    const match of
    source.matchAll(
      /process\.env\[\s*["']([A-Z][A-Z0-9_]*)["']\s*\]/g,
    )
  ) {
    runtimeKeys.add(
      match[1],
    );
  }
}

const example =
  fs.readFileSync(
    ".env.example",
    "utf8",
  );

const exampleKeys =
  new Set(
    example
      .split(
        /\r?\n/,
      )
      .filter(
        (line) =>
          /^[A-Z][A-Z0-9_]*=/.test(
            line,
          ),
      )
      .map(
        (line) =>
          line.split(
            "=",
            1,
          )[0],
      ),
  );

for (const key of runtimeKeys) {
  if (!exampleKeys.has(key)) {
    failures.push(
      `env-coverage:missing:${key}`,
    );
  }
}

const secretLike =
  [
    /_API_KEY$/,
    /_AUTH_TOKEN$/,
    /_BEARER_TOKEN$/,
    /_KEYPAIR$/,
    /_SECRET$/,
  ];

for (const line of example.split(/\r?\n/)) {
  const match =
    /^([A-Z][A-Z0-9_]*)=(.*)$/.exec(
      line,
    );

  if (!match) {
    continue;
  }

  const [
    ,
    key,
    value,
  ] =
    match;

  if (
    secretLike.some(
      (pattern) =>
        pattern.test(key),
    ) &&
    value.trim() !== ""
  ) {
    failures.push(
      `env-coverage:secret-placeholder-must-be-empty:${key}`,
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
      runtimeKeys:
        runtimeKeys.size,
      exampleKeys:
        exampleKeys.size,
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}

import fs from "node:fs";
import path from "node:path";

const failures = [];

const scriptFiles = [];

function walk(directory) {
  if (
    !fs.existsSync(
      directory,
    )
  ) {
    return;
  }

  for (
    const entry of
    fs.readdirSync(
      directory,
      {
        withFileTypes: true,
      },
    )
  ) {
    const full =
      path.join(
        directory,
        entry.name,
      );

    if (
      entry.isDirectory()
    ) {
      walk(full);
      continue;
    }

    if (
      /\.(mjs|js)$/.test(
        entry.name,
      )
    ) {
      scriptFiles.push(full);
    }
  }
}

walk("scripts");

const allowed = new Set([
  "scripts/mainnet/lib.mjs",
  "scripts/lib/atomic-json.mjs",
]);

const patterns = [
  {
    name:
      "canonical-json-implementation",
    regex:
      /Object\.keys\([^)]*\)\s*\.sort\(\)\s*\.map/,
  },
  {
    name:
      "generic-https-validator",
    regex:
      /protocol\s*!==\s*["']https:["']/,
  },
];

for (const file of scriptFiles) {
  if (allowed.has(file)) {
    continue;
  }

  const source =
    fs.readFileSync(
      file,
      "utf8",
    );

  for (const pattern of patterns) {
    if (
      pattern.regex.test(
        source,
      )
    ) {
      failures.push(
        `${pattern.name}:${file}`,
      );
    }
  }
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version: "1.0.0",
  checkedScripts:
    scriptFiles.length,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}

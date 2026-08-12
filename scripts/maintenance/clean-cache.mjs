import fs from "node:fs";
import path from "node:path";

const roots = [
  ".next",
  "dist",
  ".turbo",
  ".cache",
  "coverage",
  "target/.rustc_info.json",
  "target/debug/.fingerprint",
  "target/debug/incremental",
];

const removed = [];

for (const value of roots) {
  const resolved = path.resolve(value);
  const cwd = `${process.cwd()}${path.sep}`;

  if (resolved !== process.cwd() && !resolved.startsWith(cwd)) {
    throw new Error("PWRC_CACHE_PATH_ESCAPE");
  }

  if (fs.existsSync(resolved)) {
    fs.rmSync(resolved, {
      recursive: true,
      force: true,
    });
    removed.push(value);
  }
}

const result = {
  ok: true,
  version: "1.0.0",
  removed,
  preserved: [
    "node_modules",
    "pnpm-lock.yaml",
    "target/idl",
    "reports",
  ],
};

fs.mkdirSync("reports", { recursive: true });
fs.writeFileSync(
  "reports/cache-clean.json",
  `${JSON.stringify(result, null, 2)}\n`,
);

console.log(JSON.stringify(result, null, 2));

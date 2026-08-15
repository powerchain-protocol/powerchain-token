import fs from "node:fs";
import { execFileSync } from "node:child_process";

const failures = [];
const expectedNode =
  "v26.5.1";
const expectedPnpm =
  "11.18.0";

if (
  process.version !==
    expectedNode
) {
  failures.push(
    `toolchain-runtime:node:expected=${expectedNode}:actual=${process.version}`,
  );
}

let pnpm =
  null;

try {
  pnpm =
    execFileSync(
      "pnpm",
      [
        "--version",
      ],
      {
        encoding:
          "utf8",
        stdio: [
          "ignore",
          "pipe",
          "pipe",
        ],
      },
    ).trim();
} catch {
  failures.push(
    "toolchain-runtime:pnpm-unavailable",
  );
}

if (
  pnpm !==
    null &&
  pnpm !==
    expectedPnpm
) {
  failures.push(
    `toolchain-runtime:pnpm:expected=${expectedPnpm}:actual=${pnpm}`,
  );
}

console.log(JSON.stringify({
  ok:
    failures.length ===
    0,
  version:
    "1.0.0",
  node:
    process.version,
  expectedNode,
  pnpm,
  expectedPnpm,
  lockfilePresent:
    fs.existsSync(
      "pnpm-lock.yaml",
    ),
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}

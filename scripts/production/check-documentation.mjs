import fs from "node:fs";
import path from "node:path";

const failures = [];
const rootPackage =
  JSON.parse(
    fs.readFileSync(
      "package.json",
      "utf8",
    ),
  );

const docs = [
  "README.md",
  "CHANGELOG.md",
  "contracts/README.md",
  "programs/README.md",
  "programs/pwrc-lock/README.md",
  "programs/token/README.md",
  "swagger/README.md",
];

const requiredRootReadme = [
  "PowerChain Token",
  "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc",
  "18,446,000,000 PWRC",
  "POWERCHAIN_PWRC_TOKEN_POLICY_V1",
  "SOURCE_READY",
  "config/mainnet/token-fee-authorities.json",
  "pnpm production:check",
  "CHANGELOG.md",
];

for (const file of docs) {
  if (!fs.existsSync(file)) {
    failures.push(
      `docs:missing:${file}`,
    );
  }
}

const rootReadme =
  fs.readFileSync(
    "README.md",
    "utf8",
  );

for (const invariant of requiredRootReadme) {
  if (!rootReadme.includes(invariant)) {
    failures.push(
      `docs:root-readme:${invariant}`,
    );
  }
}

const changelog =
  fs.readFileSync(
    "CHANGELOG.md",
    "utf8",
  );

if (
  !changelog.includes(
    "## [1.0.0]",
  ) ||
  changelog.includes(
    "## v29",
  ) ||
  changelog.includes(
    "## v30",
  ) ||
  changelog.includes(
    "## v31",
  )
) {
  failures.push(
    "docs:changelog-release-structure",
  );
}

for (const file of docs) {
  const text =
    fs.readFileSync(
      file,
      "utf8",
    );

  for (
    const match of
      text.matchAll(
        /\]\(([^)]+\.md)(?:#[^)]+)?\)/g,
      )
  ) {
    const target =
      path.resolve(
        path.dirname(file),
        match[1],
      );

    if (!fs.existsSync(target)) {
      failures.push(
        `docs:broken-link:${file}:${match[1]}`,
      );
    }
  }

  for (
    const match of
      text.matchAll(
        /pnpm ([a-zA-Z0-9:_-]+)/g,
      )
  ) {
    const script =
      match[1];

    if (
      ![
        "install",
        "--version",
      ].includes(
        script,
      ) &&
      !Object.prototype.hasOwnProperty.call(
        rootPackage.scripts,
        script,
      )
    ) {
      failures.push(
        `docs:unknown-pnpm-script:${file}:${script}`,
      );
    }
  }
}

for (const file of [
  "programs/README.md",
  "programs/pwrc-lock/README.md",
  "programs/token/README.md",
]) {
  const text =
    fs.readFileSync(
      file,
      "utf8",
    );

  if (
    /\b(?:v29|v30|v31)\b/i.test(
      text,
    )
  ) {
    failures.push(
      `docs:stale-iteration-label:${file}`,
    );
  }
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  documentationFiles:
    docs.length,
  canonicalRootReadme:
    true,
  consolidatedChangelog:
    true,
  staleIterationHeadings:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}

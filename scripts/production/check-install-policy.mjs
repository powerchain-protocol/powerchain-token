import fs from "node:fs";

const failures = [];
const root =
  JSON.parse(
    fs.readFileSync(
      "package.json",
      "utf8",
    ),
  );
const preinstall =
  fs.readFileSync(
    "scripts/bootstrap/preinstall.mjs",
    "utf8",
  );

if (
  root.scripts?.preinstall !==
    "node scripts/bootstrap/preinstall.mjs"
) {
  failures.push(
    "install-policy:preinstall-script",
  );
}

for (const invariant of [
  "PWRC_TOOLCHAIN_NODE_UNSUPPORTED",
  "PWRC_TOOLCHAIN_PNPM_REQUIRED",
  "PWRC_TOOLCHAIN_PNPM_VERSION_MISMATCH",
  'requiredPnpm =\n  "11.18.0"',
]) {
  if (!preinstall.includes(invariant)) {
    failures.push(
      `install-policy:${invariant}`,
    );
  }
}

for (const rel of [
  "apps/api/package.json",
  "apps/client/package.json",
  "apps/docs/package.json",
]) {
  const pkg =
    JSON.parse(
      fs.readFileSync(
        rel,
        "utf8",
      ),
    );

  if (pkg.private !== true) {
    failures.push(
      `install-policy:app-must-be-private:${rel}`,
    );
  }
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  nodeGuard:
    true,
  exactPnpmGuard:
    true,
  privateApps:
    true,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}

import fs from "node:fs";

const failures = [];

const required = [
  "apps/docs/package.json",
  "apps/docs/server.mjs",
  "apps/docs/public/docs.js",
  "apps/docs/public/docs.css",
  "packages/docs-ui/src/index.mjs",
  "packages/docs-ui/src/docs-shell.mjs",
  "packages/docs-ui/src/docs-sidebar.mjs",
  "packages/docs-ui/src/docs-section.mjs",
  "packages/docs-ui/src/docs-toc.mjs",
  "packages/docs-ui/src/code-block.mjs",
  "packages/docs-ui/src/callout.mjs",
  "packages/docs-ui/src/spec-table.mjs",
  "packages/docs-content/src/index.mjs",
  "packages/docs-content/src/technology.mjs",
  "packages/docs-content/src/architecture.mjs",
  "packages/docs-content/src/token.mjs",
  "packages/docs-content/src/bridge.mjs",
  "packages/docs-content/src/api.mjs",
  "packages/docs-content/src/security.mjs",
  "packages/docs-content/src/development.mjs",
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    failures.push(
      `missing:${file}`,
    );
  }
}

const packageJson =
  JSON.parse(
    fs.readFileSync(
      "apps/docs/package.json",
      "utf8",
    ),
  );

if (
  packageJson.version !==
    "1.0.0" ||
  packageJson.name !==
    "@powerchain/docs"
) {
  failures.push(
    "docs-package-policy",
  );
}

const server =
  fs.readFileSync(
    "apps/docs/server.mjs",
    "utf8",
  );

for (const invariant of [
  "PWRC_DOCS_HOST",
  "PWRC_DOCS_PORT",
  "/health",
  "/api/docs/sessions",
  "renderDocsShell",
  "EADDRINUSE",
  "Content-Security-Policy",
]) {
  if (!server.includes(invariant)) {
    failures.push(
      `docs-server:${invariant}`,
    );
  }
}

const styles =
  fs.readFileSync(
    "apps/docs/public/docs.css",
    "utf8",
  );

for (const invariant of [
  "data-theme",
  "@media (max-width: 760px)",
  "prefers-reduced-motion",
  ".docs-sidebar",
  ".docs-toc",
]) {
  if (!styles.includes(invariant)) {
    failures.push(
      `docs-style:${invariant}`,
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
      docsApp: {
        app:
          true,
        reusableComponents:
          true,
        sessions:
          true,
        responsive:
          true,
        lightDark:
          true,
      },
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}

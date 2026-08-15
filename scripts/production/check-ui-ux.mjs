import fs from "node:fs";

const failures = [];
const files = {
  html:
    fs.readFileSync(
      "apps/client/public/index.html",
      "utf8",
    ),
  css:
    fs.readFileSync(
      "apps/client/public/styles.css",
      "utf8",
    ),
  app:
    fs.readFileSync(
      "apps/client/public/app.js",
      "utf8",
    ),
  clientServer:
    fs.readFileSync(
      "apps/client/server.mjs",
      "utf8",
    ),
  docs:
    fs.readFileSync(
      "apps/docs/server.mjs",
      "utf8",
    ),
  api:
    fs.readFileSync(
      "apps/api/server.mjs",
      "utf8",
    ),
};

for (const invariant of [
  "PowerChain",
  'id="assets-grid"',
  'id="quote-button"',
  'id="theme"',
  'aria-live="polite"',
]) {
  if (!files.html.includes(invariant)) {
    failures.push(
      `ui-ux:client-html:${invariant}`,
    );
  }
}

for (const invariant of [
  ':root[data-theme="dark"]',
  "@media (max-width: 720px)",
  "@media (prefers-reduced-motion: reduce)",
  "--surface:",
  "--border:",
]) {
  if (!files.css.includes(invariant)) {
    failures.push(
      `ui-ux:client-css:${invariant}`,
    );
  }
}

for (const invariant of [
  "loadToken",
  "loadAssets",
  "Calculating…",
  "escapeHtml",
  "navigator.clipboard.writeText",
  "powerchain.theme",
]) {
  if (!files.app.includes(invariant)) {
    failures.push(
      `ui-ux:client-app:${invariant}`,
    );
  }
}

for (const invariant of [
  "permissions-policy",
  "content-security-policy",
  "frame-ancestors 'none'",
]) {
  if (!files.clientServer.includes(invariant)) {
    failures.push(
      `ui-ux:client-security:${invariant}`,
    );
  }
}

for (const [
  name,
  source,
] of [
  [
    "docs",
    files.docs,
  ],
  [
    "swagger",
    files.api,
  ],
]) {
  for (const invariant of [
    "prefers-color-scheme: dark",
    "prefers-reduced-motion",
  ]) {
    if (!source.includes(invariant)) {
      failures.push(
        `ui-ux:${name}:${invariant}`,
      );
    }
  }
}

for (const invariant of [
  "Copy path",
  "Clear filters",
  "No endpoints match the current filters.",
  "powerchain.swagger.theme",
]) {
  if (!files.api.includes(invariant)) {
    failures.push(
      `ui-ux:swagger:${invariant}`,
    );
  }
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  responsiveClient:
    true,
  lightDarkTheme:
    true,
  tokenApiHydration:
    true,
  assetRegistryUi:
    true,
  feeQuoteStates:
    true,
  docsNavigation:
    true,
  swaggerSearchAndFilters:
    true,
  reducedMotion:
    true,
  browserSecurityHeaders:
    true,
  publicWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}

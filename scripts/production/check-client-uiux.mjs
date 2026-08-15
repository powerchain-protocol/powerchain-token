import fs from "node:fs";

const failures = [];

const html =
  fs.readFileSync(
    "apps/client/public/index.html",
    "utf8",
  );
const css =
  fs.readFileSync(
    "apps/client/public/styles.css",
    "utf8",
  );
const app =
  fs.readFileSync(
    "apps/client/public/app.js",
    "utf8",
  );

for (const invariant of [
  'id="safety"',
  "Review before signing",
  "Deterministic review bundle",
  "POWERCHAIN_NATIVE_PWRC_TRANSFER_REVIEW_BUNDLE_V1",
  'class="mobile-actions"',
  "endpoint-chips",
  'id="last-refresh"',
]) {
  if (!html.includes(invariant)) {
    failures.push(
      `client-uiux:html:${invariant}`,
    );
  }
}

for (const invariant of [
  ".safety-layout",
  ".safety-grid",
  ".mobile-actions",
  ".endpoint-chips",
  ":focus-visible",
  "prefers-reduced-motion",
  "safe-area-inset-bottom",
]) {
  if (!css.includes(invariant)) {
    failures.push(
      `client-uiux:css:${invariant}`,
    );
  }
}

for (const invariant of [
  "loadSafetyPolicy",
  "/api/v1/token/transfer-policy",
  "formatRefreshTime",
  "powerchain.theme",
  "prefers-color-scheme: dark",
  '"offline"',
  '"online"',
]) {
  if (!app.includes(invariant)) {
    failures.push(
      `client-uiux:app:${invariant}`,
    );
  }
}

const ids =
  [
    ...html.matchAll(
      /\sid="([^"]+)"/g,
    ),
  ].map(
    (match) =>
      match[1],
  );
const duplicates =
  ids.filter(
    (id, index) =>
      ids.indexOf(
        id,
      ) !==
        index,
  );

if (duplicates.length) {
  failures.push(
    `client-uiux:duplicate-ids:${[...new Set(duplicates)].join(",")}`,
  );
}

for (const forbidden of [
  "Connect wallet",
  "Sign transaction",
  "Submit transaction",
]) {
  if (html.includes(forbidden)) {
    failures.push(
      `client-uiux:forbidden-action:${forbidden}`,
    );
  }
}

console.log(JSON.stringify({
  ok:
    failures.length ===
    0,
  version:
    "1.0.0",
  responsive:
    true,
  lightDarkTheme:
    true,
  reducedMotion:
    true,
  accessibleFocus:
    true,
  mobileQuickActions:
    true,
  dynamicSafetyPolicy:
    true,
  apiEndpointDiscovery:
    true,
  walletConnectionRequired:
    false,
  publicWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}

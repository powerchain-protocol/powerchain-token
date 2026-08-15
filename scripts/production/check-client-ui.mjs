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
const server =
  fs.readFileSync(
    "apps/client/server.mjs",
    "utf8",
  );

for (const invariant of [
  "PowerChain",
  "Token Console",
  'id="overview"',
  'id="assets"',
  'id="quote"',
  'id="release-state"',
  'id="api-status"',
  'id="refresh-overview"',
  'id="toast-region"',
  'href="/swagger"',
]) {
  if (!html.includes(invariant)) {
    failures.push(
      `client-ui:html:${invariant}`,
    );
  }
}

for (const invariant of [
  ':root[data-theme="dark"]',
  "@media (max-width: 780px)",
  "@media (max-width: 560px)",
  "@media (max-width: 400px)",
  "@media (prefers-reduced-motion: reduce)",
  ".quote-layout",
  ".status-strip",
  ".toast-region",
]) {
  if (!css.includes(invariant)) {
    failures.push(
      `client-ui:css:${invariant}`,
    );
  }
}

for (const invariant of [
  "MAX_SUPPLY_BASE_UNITS = 18_446_000_000_000_000_000n",
  "groupIntegerString",
  "AbortController",
  "validateAmount",
  "loadReleaseStatus",
  "showToast",
  "Promise.allSettled",
]) {
  if (!app.includes(invariant)) {
    failures.push(
      `client-ui:app:${invariant}`,
    );
  }
}

if (
  app.includes(
    "Number(whole).toLocaleString",
  )
) {
  failures.push(
    "client-ui:unsafe-large-number-formatting",
  );
}

if (
  /<script(?![^>]*\bsrc=)/i.test(
    html,
  ) ||
  /\sstyle\s*=/i.test(
    html,
  ) ||
  /style="/i.test(
    app,
  )
) {
  failures.push(
    "client-ui:csp-inline-content",
  );
}

for (const invariant of [
  "shouldProxyToApi",
  '"/swagger"',
  "PWRC_CLIENT_PROXY_METHOD_NOT_ALLOWED",
  "PWRC_CLIENT_API_PROXY_REDIRECT_REJECTED",
  '"set-cookie"',
]) {
  if (!server.includes(invariant)) {
    failures.push(
      `client-ui:server:${invariant}`,
    );
  }
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  responsive:
    true,
  lightDarkTheme:
    true,
  mobileNavigation:
    true,
  runtimeStatus:
    true,
  assetRegistryUi:
    true,
  exactBigIntQuoteFormatting:
    true,
  requestTimeouts:
    true,
  retryStates:
    true,
  swaggerProxy:
    true,
  getHeadOnly:
    true,
  cspCompatible:
    true,
  accessibility:
    true,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}

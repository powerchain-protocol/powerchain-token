import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

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

test(
  "client UI exposes responsive token, assets, fees and API navigation",
  () => {
    for (const invariant of [
      'id="overview"',
      'id="assets"',
      'id="quote"',
      'href="/swagger"',
      'id="release-state"',
      'id="api-status"',
      'id="refresh-overview"',
      'id="toast-region"',
      'class="skip-link"',
    ]) {
      assert.ok(
        html.includes(
          invariant,
        ),
      );
    }

    for (const invariant of [
      "@media (max-width: 780px)",
      "@media (max-width: 560px)",
      "@media (prefers-reduced-motion: reduce)",
      ':root[data-theme="dark"]',
      ".toast-region",
      ".quote-layout",
      ".status-strip",
    ]) {
      assert.ok(
        css.includes(
          invariant,
        ),
      );
    }
  },
);

test(
  "client amount formatting remains exact for canonical PWRC-sized integers",
  () => {
    assert.ok(
      app.includes(
        "MAX_SUPPLY_BASE_UNITS = 18_446_000_000_000_000_000n",
      ),
    );
    assert.ok(
      app.includes(
        "groupIntegerString",
      ),
    );
    assert.ok(
      app.includes(
        "BigInt(whole) * SCALE",
      ),
    );
    assert.equal(
      app.includes(
        "Number(whole).toLocaleString",
      ),
      false,
    );
  },
);

test(
  "client API UX has timeouts retries and guarded browser storage",
  () => {
    for (const invariant of [
      "REQUEST_TIMEOUT_MS",
      "AbortController",
      "data-retry-assets",
      "data-retry-quote",
      "Promise.allSettled",
      "try {",
      'localStorage.setItem("powerchain.theme"',
      'localStorage.getItem("powerchain.theme")',
    ]) {
      assert.ok(
        app.includes(
          invariant,
        ),
      );
    }
  },
);

test(
  "client server proxies Swagger and remains GET/HEAD-only",
  () => {
    for (const invariant of [
      "shouldProxyToApi",
      'pathname ===\n      "/swagger"',
      'pathname.startsWith(\n      "/swagger/"',
      '"GET" &&',
      '"HEAD"',
      "PWRC_CLIENT_PROXY_METHOD_NOT_ALLOWED",
      "PWRC_CLIENT_API_PROXY_REDIRECT_REJECTED",
      '"set-cookie"',
    ]) {
      assert.ok(
        server.includes(
          invariant,
        ),
      );
    }
  },
);

test(
  "client markup remains compatible with self-only script/style CSP",
  () => {
    assert.equal(
      /<script(?![^>]*\bsrc=)/i.test(
        html,
      ),
      false,
    );
    assert.equal(
      /\sstyle\s*=/i.test(
        html,
      ),
      false,
    );
    assert.equal(
      /style="/i.test(
        app,
      ),
      false,
    );
  },
);

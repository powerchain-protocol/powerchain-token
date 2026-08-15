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
const docs =
  fs.readFileSync(
    "apps/docs/server.mjs",
    "utf8",
  );
const api =
  fs.readFileSync(
    "apps/api/server.mjs",
    "utf8",
  );

test(
  "client UI exposes token, assets, fees and API navigation",
  () => {
    for (const invariant of [
      'href="#token"',
      'href="#assets"',
      'href="#quote"',
      'href="/swagger"',
      'id="theme"',
      'id="assets-grid"',
      'id="quote-button"',
      'aria-live="polite"',
    ]) {
      assert.ok(
        html.includes(
          invariant,
        ),
      );
    }
  },
);

test(
  "client UI supports responsive light/dark design and reduced motion",
  () => {
    for (const invariant of [
      ':root[data-theme="dark"]',
      "@media (max-width: 720px)",
      "@media (max-width: 520px)",
      "@media (prefers-reduced-motion: reduce)",
      "--navy:",
      "--accent:",
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
  "client UI has loading, error, copy and theme states",
  () => {
    for (const invariant of [
      "initializeTheme",
      "Promise.allSettled",
      "Calculating…",
      "API unavailable",
      "Asset registry unavailable",
      "navigator.clipboard.writeText",
      "escapeHtml",
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
  "docs and Swagger share responsive theme-aware UX",
  () => {
    for (const source of [
      docs,
      api,
    ]) {
      assert.ok(
        source.includes(
          "prefers-color-scheme: dark",
        ),
      );
      assert.ok(
        source.includes(
          "prefers-reduced-motion",
        ),
      );
    }

    assert.ok(
      api.includes(
        "Copy path",
      ),
    );
    assert.ok(
      api.includes(
        "No endpoints match the current filters.",
      ),
    );
  },
);

test(
  "client static serving applies a restrictive browser security baseline",
  () => {
    const server =
      fs.readFileSync(
        "apps/client/server.mjs",
        "utf8",
      );

    for (const invariant of [
      '"x-frame-options"',
      '"permissions-policy"',
      '"content-security-policy"',
      "frame-ancestors 'none'",
      "object-src 'none'",
    ]) {
      assert.ok(
        server.includes(
          invariant,
        ),
      );
    }
  },
);

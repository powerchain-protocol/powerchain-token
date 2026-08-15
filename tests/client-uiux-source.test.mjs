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

test(
  "client navigation and section hierarchy are coherent",
  () => {
    for (const id of [
      "overview",
      "assets",
      "safety",
      "quote",
    ]) {
      assert.ok(
        html.includes(
          `id="${id}"`,
        ),
      );
      assert.ok(
        html.includes(
          `href="#${id}"`,
        ),
      );
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

    assert.equal(
      new Set(
        ids,
      ).size,
      ids.length,
    );
  },
);

test(
  "client exposes transaction safety without signing or submission actions",
  () => {
    for (const invariant of [
      "Review before signing",
      "Deterministic review bundle",
      "POWERCHAIN_NATIVE_PWRC_TRANSFER_REVIEW_BUNDLE_V1",
      "No signing",
      "/api/v1/token/transfer-policy",
    ]) {
      assert.ok(
        html.includes(
          invariant,
        ) ||
        app.includes(
          invariant,
        ),
      );
    }

    for (const forbidden of [
      "Connect wallet",
      "Sign transaction",
      "Submit transaction",
    ]) {
      assert.equal(
        html.includes(
          forbidden,
        ),
        false,
      );
    }
  },
);

test(
  "responsive and accessible interaction states are present",
  () => {
    for (const invariant of [
      ":focus-visible",
      "prefers-reduced-motion",
      ".mobile-actions",
      "@media (max-width: 640px)",
      "env(safe-area-inset-bottom)",
    ]) {
      assert.ok(
        css.includes(
          invariant,
        ),
      );
    }

    for (const invariant of [
      "skip-link",
      'aria-live="polite"',
      'aria-busy="true"',
      'aria-label="Quick actions"',
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
  "theme, runtime freshness and connectivity feedback are dynamic",
  () => {
    for (const invariant of [
      "powerchain.theme",
      "prefers-color-scheme: dark",
      "formatRefreshTime",
      "#last-refresh",
      'window.addEventListener(\n  "offline"',
      'window.addEventListener(\n  "online"',
      "loadSafetyPolicy",
    ]) {
      assert.ok(
        app.includes(
          invariant,
        ),
      );
    }
  },
);

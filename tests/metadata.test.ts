import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

test("PWRC metadata and logos exist", () => {
  const pwrc = JSON.parse(fs.readFileSync("metadata/metadata.json", "utf8"));
  const wpwrc = JSON.parse(fs.readFileSync("metadata/wpwrc.metadata.json", "utf8"));

  assert.equal(pwrc.name, "PowerChain");
  assert.equal(pwrc.symbol, "PWRC");
  assert.ok(fs.existsSync("metadata/assets/pwrc-logo.png"));

  assert.equal(wpwrc.name, "Wrapped PowerChain");
  assert.equal(wpwrc.symbol, "wPWRC");
  assert.ok(fs.existsSync("metadata/assets/wpwrc-logo.png"));
});

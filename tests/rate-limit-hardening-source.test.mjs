import test from "node:test";
import assert from "node:assert/strict";
import {
  createTokenBucketRateLimiter,
  parseTrustedProxyAddresses,
  resolveRateLimitClientKey,
} from "../apps/api/lib/rate-limit.mjs";

test("token bucket smooths bursts and refills deterministically", () => {
  const check = createTokenBucketRateLimiter({
    ratePerMinute: 60,
    burst: 2,
    maxBuckets: 100,
  });

  assert.equal(check("a", 0).allowed, true);
  assert.equal(check("a", 0).allowed, true);
  const denied = check("a", 0);
  assert.equal(denied.allowed, false);
  assert.equal(denied.retryAfterMs, 1000);
  assert.equal(check("a", 999).allowed, false);
  assert.equal(check("a", 1000).allowed, true);
});

test("untrusted peers cannot spoof x-forwarded-for", () => {
  const req = {
    socket: { remoteAddress: "203.0.113.10" },
    headers: { "x-forwarded-for": "198.51.100.7" },
  };

  assert.equal(
    resolveRateLimitClientKey(req, {
      trustedProxyAddresses: ["192.0.2.10"],
    }),
    "ip:203.0.113.10",
  );
});

test("explicit trusted proxy can resolve a bounded forwarded client", () => {
  const req = {
    socket: { remoteAddress: "192.0.2.10" },
    headers: {
      "x-forwarded-for": "198.51.100.7, 192.0.2.11",
    },
  };

  assert.equal(
    resolveRateLimitClientKey(req, {
      trustedProxyAddresses: ["192.0.2.10", "192.0.2.11"],
      maxForwardedHops: 1,
    }),
    "ip:198.51.100.7",
  );
});

test("invalid forwarded chains fail back to the trusted socket peer", () => {
  const req = {
    socket: { remoteAddress: "192.0.2.10" },
    headers: { "x-forwarded-for": "not-an-ip" },
  };

  assert.equal(
    resolveRateLimitClientKey(req, {
      trustedProxyAddresses: ["192.0.2.10"],
    }),
    "ip:192.0.2.10",
  );

  assert.throws(
    () => parseTrustedProxyAddresses("192.0.2.10,not-an-ip"),
    /PWRC_TRUSTED_PROXY_ADDRESSES_INVALID/,
  );
});

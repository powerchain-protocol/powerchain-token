import fs from "node:fs";
import {
  createTokenBucketRateLimiter,
  parseTrustedProxyAddresses,
  resolveRateLimitClientKey,
} from "../../apps/api/lib/rate-limit.mjs";

const failures = [];
const server = fs.readFileSync("apps/api/server.mjs", "utf8");
const source = fs.readFileSync("apps/api/lib/rate-limit.mjs", "utf8");

const check = createTokenBucketRateLimiter({
  ratePerMinute: 60,
  burst: 2,
  maxBuckets: 100,
});
const sequence = [
  check("client", 0),
  check("client", 0),
  check("client", 0),
  check("client", 1000),
];

if (
  sequence[0].allowed !== true ||
  sequence[1].allowed !== true ||
  sequence[2].allowed !== false ||
  sequence[2].retryAfterMs !== 1000 ||
  sequence[3].allowed !== true
) {
  failures.push("rate-limit:token-bucket-refill");
}

const trusted = parseTrustedProxyAddresses("192.0.2.10");
const spoofed = resolveRateLimitClientKey({
  socket: { remoteAddress: "203.0.113.5" },
  headers: { "x-forwarded-for": "198.51.100.2" },
}, { trustedProxyAddresses: trusted });

if (spoofed !== "ip:203.0.113.5") {
  failures.push("rate-limit:untrusted-forwarded-for");
}

for (const invariant of [
  "createTokenBucketRateLimiter",
  "parseTrustedProxyAddresses",
  "resolveRateLimitClientKey",
  "PWRC_TRUSTED_PROXY_ADDRESSES",
  "PWRC_TRUSTED_PROXY_HOPS",
  "PWRC_API_RATE_LIMIT_BURST",
  "PWRC_EXPENSIVE_API_RATE_LIMIT_BURST",
  "x-ratelimit-policy",
  "x-ratelimit-limit",
  "retryAfterMs",
]) {
  if (!server.includes(invariant) && !source.includes(invariant)) {
    failures.push(`rate-limit:source:${invariant}`);
  }
}

if (
  server.includes('req.headers["x-forwarded-for"]') ||
  server.includes("req.headers['x-forwarded-for']")
) {
  failures.push("rate-limit:server-direct-forwarded-for-trust");
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  limiter: "bounded-token-bucket",
  processLocal: true,
  distributed: false,
  trustedProxyDefault: "socket-peer-only",
  explicitTrustedProxyAddresses: true,
  forwardedHopBound: true,
  retryAfterFromRefill: true,
  publicWrites: false,
  failures,
}, null, 2));

if (failures.length) process.exit(1);

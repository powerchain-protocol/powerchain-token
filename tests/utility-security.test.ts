import test from "node:test";
import assert from "node:assert/strict";
import {
  createPwrcUtilityAuthorization,
} from "../packages/protocol/src/utility.js";
import {
  evaluateComputeAdmission,
} from "../packages/protocol/src/compute-security.js";

test(
  "utility authorization binds deterministic spend and idempotency",
  () => {
    const authorization =
      createPwrcUtilityAuthorization({
        requestId:
          "request-12345678",
        idempotencyKey:
          "idem-12345678",
        wallet:
          "11111111111111111111111111111111",
        workload:
          "ai-inference",
        units:
          10n,
        unitPriceBaseUnits:
          100n,
        maxSpendBaseUnits:
          2_000n,
        issuedAt:
          "2026-08-15T00:00:00.000Z",
        expiresAt:
          "2026-08-15T00:05:00.000Z",
      });

    assert.equal(
      authorization.estimatedSpendBaseUnits,
      "1000",
    );
    assert.match(
      authorization.authorizationSha256,
      /^[a-f0-9]{64}$/,
    );
  },
);

test(
  "utility authorization rejects spend above user bound",
  () => {
    assert.throws(
      () =>
        createPwrcUtilityAuthorization({
          requestId:
            "request-12345678",
          idempotencyKey:
            "idem-12345678",
          wallet:
            "11111111111111111111111111111111",
          workload:
            "ai-agent",
          units:
            10n,
          unitPriceBaseUnits:
            100n,
          maxSpendBaseUnits:
            999n,
          issuedAt:
            "2026-08-15T00:00:00.000Z",
          expiresAt:
            "2026-08-15T00:05:00.000Z",
        }),
      /PWRC_UTILITY_MAX_SPEND_EXCEEDED/,
    );
  },
);

test(
  "compute admission blocks spam, duplicate and excessive work",
  () => {
    const decision =
      evaluateComputeAdmission(
        {
          maxRequestsPerWindow:
            60,
          maxConcurrentJobs:
            4,
          maxPayloadBytes:
            1_000_000,
          maxWorkUnits:
            1000n,
          rejectDuplicateRequests:
            true,
        },
        {
          requestsInWindow:
            60,
          concurrentJobs:
            4,
          payloadBytes:
            1_000_001,
          requestedWorkUnits:
            1001n,
          duplicateRequest:
            true,
        },
      );

    assert.equal(
      decision.allowed,
      false,
    );
    assert.equal(
      decision.reasons.length,
      5,
    );
  },
);


test(
  "utility authorization rejects loose wallet and overlong lifetime",
  () => {
    assert.throws(
      () =>
        createPwrcUtilityAuthorization({
          requestId:
            "request-12345678",
          idempotencyKey:
            "idem-12345678",
          wallet:
            "22222222222222222222222222222222",
          workload:
            "ai-inference",
          units:
            1n,
          unitPriceBaseUnits:
            1n,
          maxSpendBaseUnits:
            1n,
          issuedAt:
            "2026-08-15T00:00:00.000Z",
          expiresAt:
            "2026-08-15T00:05:00.000Z",
        }),
      /PWRC_UTILITY_WALLET_INVALID/,
    );

    assert.throws(
      () =>
        createPwrcUtilityAuthorization({
          requestId:
            "request-12345678",
          idempotencyKey:
            "idem-12345678",
          wallet:
            "11111111111111111111111111111111",
          workload:
            "ai-agent",
          units:
            1n,
          unitPriceBaseUnits:
            1n,
          maxSpendBaseUnits:
            1n,
          issuedAt:
            "2026-08-15T00:00:00.000Z",
          expiresAt:
            "2026-08-15T00:15:00.001Z",
        }),
      /PWRC_UTILITY_EXPIRY_INVALID/,
    );
  },
);

test(
  "compute admission rejects zero policy capacity and zero work",
  () => {
    assert.throws(
      () =>
        evaluateComputeAdmission(
          {
            maxRequestsPerWindow:
              0,
            maxConcurrentJobs:
              1,
            maxPayloadBytes:
              1,
            maxWorkUnits:
              1n,
            rejectDuplicateRequests:
              true,
          },
          {
            requestsInWindow:
              0,
            concurrentJobs:
              0,
            payloadBytes:
              0,
            requestedWorkUnits:
              1n,
            duplicateRequest:
              false,
          },
        ),
      /PWRC_COMPUTE_POLICY_REQUEST_LIMIT_INVALID/,
    );

    assert.throws(
      () =>
        evaluateComputeAdmission(
          {
            maxRequestsPerWindow:
              1,
            maxConcurrentJobs:
              1,
            maxPayloadBytes:
              1,
            maxWorkUnits:
              1n,
            rejectDuplicateRequests:
              true,
          },
          {
            requestsInWindow:
              0,
            concurrentJobs:
              0,
            payloadBytes:
              0,
            requestedWorkUnits:
              0n,
            duplicateRequest:
              false,
          },
        ),
      /PWRC_COMPUTE_WORK_UNITS_INVALID/,
    );
  },
);

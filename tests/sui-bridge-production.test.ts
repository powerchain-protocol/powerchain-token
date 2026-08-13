import test from "node:test";
import assert from "node:assert/strict";
import {
  assertActivationReady,
  assertStateTransition,
} from "../packages/protocol/src/sui-bridge-state.js";
import {
  assertMintAuthorization,
} from "../packages/protocol/src/sui-bridge-claim.js";

test("bridge lifecycle cannot skip registration or identity verification", () => {
  assert.throws(
    () => assertStateTransition("PUBLISHED", "ACTIVE"),
    /WPWRC_INVALID_STATE_TRANSITION/,
  );
  assert.doesNotThrow(
    () => assertStateTransition("PUBLISHED", "REGISTERED"),
  );
});

test("activation requires complete deployment identity", () => {
  assert.throws(
    () =>
      assertActivationReady({
        version: "1.0.0",
        network: "testnet",
        state: "CONSERVATION_VERIFIED",
      }),
    /WPWRC_PACKAGE_ID_REQUIRED/,
  );
});

test("mint authorization expires and has bounded TTL", () => {
  const now = Date.now();
  const base = {
    version: "1.0.0" as const,
    claimHashHex: "a".repeat(64),
    solanaCluster: "devnet" as const,
    solanaSlot: "100",
    sourceSignature: "sig",
    instructionIndex: 0,
    canonicalMint: "mint",
    lockVault: "vault",
    amountBaseUnits: "1",
    suiRecipient: "0x1234",
    observedAt: new Date(now).toISOString(),
    expiresAt: new Date(now + 5 * 60_000).toISOString(),
    verifierId: "powerchain-verifier:testnet",
  };

  assert.doesNotThrow(() => assertMintAuthorization(base, now));

  assert.throws(
    () =>
      assertMintAuthorization(
        { ...base, expiresAt: new Date(now + 11 * 60_000).toISOString() },
        now,
      ),
    /WPWRC_AUTH_TTL_TOO_LONG/,
  );
});

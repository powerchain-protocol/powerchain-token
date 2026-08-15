import test from "node:test";
import assert from "node:assert/strict";
import {
  nativePwrcVerificationConfig,
} from "../apps/api/lib/native-attestation.mjs";

const base = {
  PWRC_CLUSTER:
    "devnet",
  HELIUS_ENABLED:
    "true",
  HELIUS_DEVNET_API_KEY:
    "devnet-key-123",
  PWRC_SOLANA_DEVNET_GENESIS_HASH:
    "11111111111111111111111111111111",
  PWRC_RPC_URL_SECONDARY:
    "https://rpc.example-provider.invalid/",
};

test(
  "configured Devnet verification is ready",
  () => {
    const result =
      nativePwrcVerificationConfig(
        base,
      );

    assert.equal(
      result.configured,
      true,
    );
    assert.equal(
      result.failClosed,
      false,
    );
    assert.equal(
      result.secondaryProviderConfigured,
      true,
    );
  },
);

test(
  "missing secondary provider fails closed",
  () => {
    const {
      PWRC_RPC_URL_SECONDARY:
        _secondary,
      ...env
    } =
      base;
    const result =
      nativePwrcVerificationConfig(
        env,
      );

    assert.equal(
      result.configured,
      false,
    );
    assert.ok(
      result.failures.includes(
        "PWRC_NATIVE_VERIFICATION_SECONDARY_RPC_REQUIRED",
      ),
    );
  },
);

test(
  "same Helius provider family fails closed",
  () => {
    const result =
      nativePwrcVerificationConfig({
        ...base,
        PWRC_RPC_URL_SECONDARY:
          "https://devnet.helius-rpc.com/?api-key=another-key",
      });

    assert.equal(
      result.configured,
      false,
    );
    assert.ok(
      result.failures.some(
        (failure) =>
          failure.startsWith(
            "PWRC_SECONDARY_RPC_PROVIDER_MUST_DIFFER:helius",
          ),
      ),
    );
  },
);

test(
  "verification tuning is bounded",
  () => {
    assert.throws(
      () =>
        nativePwrcVerificationConfig({
          ...base,
          PWRC_NATIVE_VERIFY_MIN_OBSERVERS:
            "1",
        }),
      /PWRC_NATIVE_VERIFICATION_CONFIG_INVALID:PWRC_NATIVE_VERIFY_MIN_OBSERVERS/,
    );
  },
);

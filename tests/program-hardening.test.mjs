import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const lock =
  fs.readFileSync(
    "programs/pwrc-lock/src/lib.rs",
    "utf8",
  );
const token =
  fs.readFileSync(
    "programs/token/src/lib.rs",
    "utf8",
  );
const sui =
  fs.readFileSync(
    "contracts/wpwrc/sources/wpwrc.move",
    "utf8",
  );
const policy =
  JSON.parse(
    fs.readFileSync(
      "config/programs/policy.json",
      "utf8",
    ),
  );

test(
  "Solana bridge admin is singleton, role-separated and two-step",
  () => {
    assert.match(
      lock,
      /BRIDGE_STATE_SEED/,
    );
    assert.match(
      lock,
      /accept_governor/,
    );
    assert.match(
      lock,
      /cancel_governor_transfer/,
    );
    assert.match(
      lock,
      /RoleSeparationRequired/,
    );
    assert.match(
      lock,
      /GovernorTransferPending/,
    );
    assert.match(
      lock,
      /admin_sequence/,
    );
    assert.doesNotMatch(
      lock,
      /\b(mint_to|release_pwrc|mint_pwrc)\b/,
    );
  },
);

test(
  "PWRC token verifier remains verification-only",
  () => {
    assert.match(
      token,
      /ProfileVerified/,
    );
    assert.match(
      token,
      /MintAuthorityPresent/,
    );
    assert.match(
      token,
      /FreezeAuthorityPresent/,
    );
    assert.doesNotMatch(
      token,
      /\b(mint_to|set_authority|transfer_checked)\b/,
    );
  },
);

test(
  "Sui wrapped controller rejects zero evidence and protects sequences",
  () => {
    for (const invariant of [
      "E_ZERO_MESSAGE_DIGEST",
      "E_ZERO_SOLANA_RECIPIENT",
      "checked_next_sequence",
      "accept_governor",
      "cancel_governor_transfer",
      "E_ROLE_SEPARATION",
      "E_GOVERNOR_TRANSFER_PENDING",
    ]) {
      assert.ok(
        sui.includes(
          invariant,
        ),
      );
    }
  },
);

test(
  "program policy commitment is pinned",
  () => {
    assert.equal(
      policy.version,
      "1.0.0",
    );
    assert.equal(
      policy.policySha256,
      "d001fc2f47e5bb50e1edcb4163cdb6f42b49401ff337ddd9a0f535670d0303e5",
    );
    assert.equal(
      policy.solana.tokenVerifier.verificationOnly,
      true,
    );
    assert.equal(
      policy.solana.bridgeAdmin.monetaryCustodyInstructions,
      false,
    );
  },
);

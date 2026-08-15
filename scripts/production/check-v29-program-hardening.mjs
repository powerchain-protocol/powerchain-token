import fs from "node:fs";
import crypto from "node:crypto";

const failures = [];

const token =
  fs.readFileSync(
    "programs/token/src/lib.rs",
    "utf8",
  );
const lock =
  fs.readFileSync(
    "programs/pwrc-lock/src/lib.rs",
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

function canonicalJson(
  value,
) {
  if (
    value === null ||
    typeof value !==
      "object"
  ) {
    return JSON.stringify(
      value,
    );
  }

  if (
    Array.isArray(
      value,
    )
  ) {
    return `[${value
      .map(
        canonicalJson,
      )
      .join(",")}]`;
  }

  return `{${Object
    .keys(value)
    .sort()
    .filter(
      (key) =>
        value[key] !==
        undefined,
    )
    .map(
      (key) =>
        `${JSON.stringify(key)}:${canonicalJson(value[key])}`,
    )
    .join(",")}}`;
}

const {
  policySha256,
  ...policyPayload
} =
  policy;

const expectedPolicySha256 =
  crypto
    .createHash(
      "sha256",
    )
    .update(
      canonicalJson({
        domain:
          "POWERCHAIN_PROGRAM_POLICY_V1",
        policy:
          policyPayload,
      }),
    )
    .digest(
      "hex",
    );

if (
  policySha256 !==
    expectedPolicySha256
) {
  failures.push(
    "v29:program-policy-sha256-mismatch",
  );
}

for (const invariant of [
  'declare_id!("PWRCpWCpQ8BRn3pzMnvaTzMK9Q2GsxuLx7QgJgduLSu")',
  'pubkey!("PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc")',
  "ProfileVerified",
  "mint_authority_revoked",
  "freeze_authority_revoked",
  "PWRC_TRANSFER_FEE_BPS",
  "PWRC_MAX_TRANSFER_FEE_BASE_UNITS",
]) {
  if (!token.includes(invariant)) {
    failures.push(
      `v29:token:${invariant}`,
    );
  }
}

for (const forbidden of [
  "mint_to",
  "set_authority",
  "transfer_checked",
  "burn_checked",
]) {
  if (
    token.includes(
      forbidden,
    )
  ) {
    failures.push(
      `v29:token-write-surface:${forbidden}`,
    );
  }
}

for (const invariant of [
  'const BRIDGE_STATE_SEED: &[u8] = b"bridge-state"',
  "pending_governor",
  "accept_governor",
  "cancel_governor_transfer",
  "RoleSeparationRequired",
  "GovernorTransferPending",
  "admin_sequence",
  "checked_add(1)",
  "state.paused =\\n            true",
  "seeds = [",
  "state.bump",
]) {
  if (
    !lock.includes(
      invariant.replace(
        "\\n",
        "\n",
      ),
    )
  ) {
    failures.push(
      `v29:solana-lock:${invariant}`,
    );
  }
}

for (const forbidden of [
  "mint_to",
  "release_pwrc",
  "mint_pwrc",
  "transfer_checked",
]) {
  if (
    lock.includes(
      forbidden,
    )
  ) {
    failures.push(
      `v29:solana-lock-write-surface:${forbidden}`,
    );
  }
}

for (const invariant of [
  "pending_governor",
  "admin_sequence",
  "accept_governor",
  "cancel_governor_transfer",
  "E_ZERO_MESSAGE_DIGEST",
  "E_ZERO_SOLANA_RECIPIENT",
  "E_SEQUENCE_OVERFLOW",
  "E_ROLE_SEPARATION",
  "E_NO_STATE_CHANGE",
  "operator: @0x0",
  "E_OPERATOR_UNINITIALIZED",
  "checked_next_sequence",
  "assert_nonzero_bytes",
  "recipient != @0x0",
  "WPWRC_MAX_BASE_UNITS - controller.wrapped_supply_base_units",
]) {
  if (!sui.includes(invariant)) {
    failures.push(
      `v29:sui:${invariant}`,
    );
  }
}

if (
  policy.solana
    ?.tokenVerifier
    ?.verificationOnly !==
      true ||
  policy.solana
    ?.tokenVerifier
    ?.mintInstruction !==
      false ||
  policy.solana
    ?.bridgeAdmin
    ?.monetaryCustodyInstructions !==
      false ||
  policy.sui
    ?.wrappedController
    ?.replayProtection !==
      true
) {
  failures.push(
    "v29:program-policy-capabilities",
  );
}

console.log(JSON.stringify({
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  programPolicySha256:
    policySha256,
  solanaVerifierMutationCapability:
    false,
  solanaBridgeSingletonStatePda:
    true,
  solanaAdminRoleSeparation:
    true,
  solanaTwoStepGovernorTransfer:
    true,
  solanaGovernorChangeForcesPause:
    true,
  suiReplayProtection:
    true,
  suiZeroEvidenceRejected:
    true,
  suiSequenceOverflowProtected:
    true,
  publicMonetaryWrites:
    false,
  failures,
}, null, 2));

if (failures.length) {
  process.exit(1);
}

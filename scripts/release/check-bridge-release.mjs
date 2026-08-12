import fs from "node:fs";

const failures = [];

const bridge = JSON.parse(
  fs.readFileSync(
    "config/bridge.json",
    "utf8",
  ),
);
const relayer = JSON.parse(
  fs.readFileSync(
    "config/relayer/policy.json",
    "utf8",
  ),
);
const sui = JSON.parse(
  fs.readFileSync(
    "config/sui/wpwrc.json",
    "utf8",
  ),
);
const programs = JSON.parse(
  fs.readFileSync(
    "config/programs/onchain.json",
    "utf8",
  ),
);

if (
  bridge.canonical.decimals !== 9
) {
  failures.push(
    "canonical.decimals",
  );
}

if (
  bridge.canonical["mainnet-beta"]?.mint !==
  "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc"
) {
  failures.push(
    "canonical.mint",
  );
}

if (
  bridge.canonical
    .transferFee?.basisPoints !==
  250
) {
  failures.push(
    "canonical.transferFee",
  );
}

if (
  bridge.wrapped.decimals !== 9
) {
  failures.push(
    "wrapped.decimals",
  );
}

if (
  bridge.policy
    .canonicalBaseUnitsPerWrappedBaseUnit !==
  "1"
) {
  failures.push(
    "bridge.baseUnitFactor",
  );
}

if (
  bridge.wrapped
    .genesisSupplyBaseUnits !== "0"
) {
  failures.push(
    "bridge.wrappedGenesis",
  );
}

if (
  bridge.policy
    .solanaTransferFeeAware !== true
) {
  failures.push(
    "bridge.feeAware",
  );
}

if (
  relayer.mode !== "fail-closed"
) {
  failures.push(
    "relayer.mode",
  );
}

if (
  relayer.separation
    .aiWorkerMayHoldSigningKey !==
  false
) {
  failures.push(
    "relayer.aiSigner",
  );
}

if (
  sui.wrapped
    .genesisSupplyBaseUnits !== "0"
) {
  failures.push(
    "sui.genesisSupply",
  );
}

if (
  sui.wrapped.mintPolicy !==
  "bridge-only"
) {
  failures.push(
    "sui.mintPolicy",
  );
}

if (
  sui.security
    .treasuryCapEncapsulated !==
  true
) {
  failures.push(
    "sui.treasuryCapEncapsulation",
  );
}

if (
  programs.solana.pwrcFees
    .nativeToken2022TransferFeeBpsExpected !==
  250
) {
  failures.push(
    "solana.transferFee",
  );
}

if (
  programs.solana.pwrcFees
    .protocolRouterFeeBps !== 0
) {
  failures.push(
    "solana.customRouterFee",
  );
}

if (
  programs.solana.pwrcLock
    .mainnetProgramId !== null
) {
  failures.push(
    "unverified mainnet Solana bridge ID must remain null",
  );
}

if (
  programs.solana.pwrcToken
    .mainnetProgramId !== null
) {
  failures.push(
    "unverified mainnet token verifier ID must remain null",
  );
}

if (
  programs.sui.wpwrc
    .packageIdMainnet !== null
) {
  failures.push(
    "unverified mainnet Sui package ID must remain null",
  );
}

const result = {
  ok: failures.length === 0,
  version: "1.0.0",
  releaseState:
    failures.length === 0
      ? "configuration-ready"
      : "blocked",
  canonicalMint:
    bridge.canonical["mainnet-beta"].mint,
  transferFeeBasisPoints:
    bridge.canonical
      .transferFee.basisPoints,
  failures,
};

fs.mkdirSync(
  "reports",
  {
    recursive: true,
  },
);

fs.writeFileSync(
  "reports/bridge-release-readiness.json",
  `${JSON.stringify(
    result,
    null,
    2,
  )}\n`,
);

console.log(
  JSON.stringify(
    result,
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}

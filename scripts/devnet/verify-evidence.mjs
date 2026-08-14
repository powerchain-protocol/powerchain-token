import fs from "node:fs";

const failures = [];

function readJson(file, label) {
  if (!fs.existsSync(file)) {
    failures.push(`missing:${file}`);
    return null;
  }

  try {
    return JSON.parse(
      fs.readFileSync(
        file,
        "utf8",
      ),
    );
  } catch {
    failures.push(`${label}:invalid-json`);
    return null;
  }
}

const solana =
  readJson(
    "deployments/devnet/solana/evidence.json",
    "solana",
  );
const sui =
  readJson(
    "deployments/devnet/sui/evidence.json",
    "sui",
  );
const suiVerification =
  readJson(
    "deployments/devnet/sui/verification.json",
    "sui-verification",
  );

if (solana) {
  if (
    solana.version !== "1.0.0" ||
    solana.network !== "devnet"
  ) {
    failures.push("solana:identity");
  }

  const token =
    solana.programs?.pwrcToken;
  const lock =
    solana.programs?.pwrcLock;

  if (
    token?.programId !==
      "PWRCpWCpQ8BRn3pzMnvaTzMK9Q2GsxuLx7QgJgduLSu"
  ) {
    failures.push("solana:pwrc-token-id");
  }

  for (const [
    label,
    program,
  ] of [
    ["pwrcToken", token],
    ["pwrcLock", lock],
  ]) {
    if (!program?.programId) {
      failures.push(`solana:${label}:programId`);
      continue;
    }

    for (const field of [
      "binarySha256",
      "deployLogSha256",
      "showLogSha256",
    ]) {
      if (
        !/^[a-f0-9]{64}$/i.test(
          program[field] ?? "",
        )
      ) {
        failures.push(`solana:${label}:${field}`);
      }
    }
  }
}

if (sui) {
  if (
    sui.version !== "1.0.0" ||
    sui.network !== "devnet"
  ) {
    failures.push("sui:identity");
  }

  for (const field of [
    "transactionDigest",
    "packageId",
  ]) {
    if (!sui[field]) {
      failures.push(`sui:${field}`);
    }
  }

  if (
    !Array.isArray(
      sui.createdObjects,
    )
  ) {
    failures.push("sui:createdObjects");
  }
}

if (suiVerification) {
  if (
    suiVerification.ok !== true ||
    suiVerification.version !== "1.0.0" ||
    suiVerification.network !== "devnet"
  ) {
    failures.push("sui-verification:identity");
  }
}

const result = {
  ok:
    failures.length === 0,
  version:
    "1.0.0",
  network:
    "devnet",
  failures,
};

fs.mkdirSync(
  "reports",
  { recursive: true },
);
fs.writeFileSync(
  "reports/devnet-evidence-verification.json",
  `${JSON.stringify(result, null, 2)}\n`,
);

console.log(
  JSON.stringify(
    result,
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(2);
}

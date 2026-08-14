import fs from "node:fs";

const failures = [];

const fees =
  JSON.parse(
    fs.readFileSync(
      "config/fees.json",
      "utf8",
    ),
  );
const constants =
  fs.readFileSync(
    "packages/protocol/src/constants.ts",
    "utf8",
  );
const api =
  fs.readFileSync(
    "apps/api/lib/service-fee-recipients.mjs",
    "utf8",
  );

const expected = {
  solana:
    "FeeszhrKKEsvxr1kg8LDtPx6BLcEbYHiAThYaxajNhqy",
  sui:
    "0xc23c9622a09c5533fd18f35703622dc2df44206749a1761202d2024a04a36f50",
};

for (const [
  chain,
  address,
] of
Object.entries(
  expected,
)) {
  if (
    fees.serviceFee
      ?.sourceDebitRecipients
      ?.[chain] !==
      address
  ) {
    failures.push(
      `service-fee:config:${chain}`,
    );
  }

  if (
    !constants.includes(
      address,
    ) ||
    !api.includes(
      address,
    )
  ) {
    failures.push(
      `service-fee:source:${chain}`,
    );
  }
}

if (
  fees.accounting
    ?.serviceFeeIsSeparateSourceDebit !==
    true ||
  fees.accounting
    ?.serviceFeeNeverReducesNttPrincipal !==
    true
) {
  failures.push(
    "service-fee:principal-policy",
  );
}

console.log(
  JSON.stringify(
    {
      ok:
        failures.length === 0,
      version:
        "1.0.0",
      recipients:
        expected,
      principal:
        "unchanged-1:1",
      failures,
    },
    null,
    2,
  ),
);

if (failures.length) {
  process.exit(1);
}

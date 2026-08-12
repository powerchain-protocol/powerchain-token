import fs from "node:fs";
import crypto from "node:crypto";
import {
  spawnSync,
} from "node:child_process";

const programs = [
  "pwrc_lock",
  "pwrc_token",
];

fs.mkdirSync(
  "idl/generated",
  {
    recursive: true,
  },
);

for (const program of programs) {
  const source =
    `target/idl/${program}.json`;

  const destination =
    `idl/generated/${program}.json`;

  if (!fs.existsSync(source)) {
    throw new Error(
      `PWRC_ANCHOR_IDL_SOURCE_MISSING:${program}`,
    );
  }

  const idl = JSON.parse(
    fs.readFileSync(
      source,
      "utf8",
    ),
  );

  if (
    idl.metadata?.name !==
    program
  ) {
    throw new Error(
      `PWRC_ANCHOR_IDL_NAME_INVALID:${program}`,
    );
  }

  if (
    idl.metadata?.version !==
    "1.0.0"
  ) {
    throw new Error(
      `PWRC_ANCHOR_IDL_VERSION_INVALID:${program}`,
    );
  }

  const canonical =
    `${JSON.stringify(
      idl,
      null,
      2,
    )}\n`;

  fs.writeFileSync(
    destination,
    canonical,
  );

  const sha256 = crypto
    .createHash("sha256")
    .update(canonical)
    .digest("hex");

  fs.writeFileSync(
    `idl/generated/${program}.sha256`,
    `${sha256}  ${program}.json\n`,
  );
}

const verify = spawnSync(
  process.execPath,
  [
    "scripts/idl/verify-generated.mjs",
  ],
  {
    stdio: "inherit",
  },
);

if (verify.status !== 0) {
  process.exit(
    verify.status ?? 1,
  );
}

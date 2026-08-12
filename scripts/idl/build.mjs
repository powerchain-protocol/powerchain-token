import fs from "node:fs";
import {
  spawnSync,
} from "node:child_process";

const version = spawnSync(
  "anchor",
  ["--version"],
  {
    encoding: "utf8",
  },
);

if (
  version.error ||
  version.status !== 0
) {
  throw new Error(
    "IDL_TOOL_UNAVAILABLE:anchor",
  );
}

for (const program of [
  "pwrc_lock",
  "pwrc_token",
]) {
  const result = spawnSync(
    "anchor",
    [
      "build",
      "--program-name",
      program,
    ],
    {
      stdio: "inherit",
    },
  );

  if (result.status !== 0) {
    process.exit(
      result.status ?? 1,
    );
  }

  const expected =
    `target/idl/${program}.json`;

  if (!fs.existsSync(expected)) {
    throw new Error(
      `PWRC_ANCHOR_IDL_NOT_GENERATED:${program}`,
    );
  }
}

console.log(
  "Generated Anchor IDLs for pwrc_lock and pwrc_token",
);

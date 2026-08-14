import fs from "node:fs";

const networks =
  JSON.parse(
    fs.readFileSync(
      "config/networks.json",
      "utf8",
    ),
  );

const devnet =
  JSON.parse(
    fs.readFileSync(
      "config/devnet/bridge.json",
      "utf8",
    ),
  );

const mainnet =
  JSON.parse(
    fs.readFileSync(
      "config/mainnet/bridge.json",
      "utf8",
    ),
  );

console.log(
  JSON.stringify(
    {
      ok: true,
      version: "1.0.0",
      canonicalMint:
        "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc",
      pwrcTokenSourceProgramId:
        "PWRCpWCpQ8BRn3pzMnvaTzMK9Q2GsxuLx7QgJgduLSu",
      networks,
      devnet,
      mainnet,
    },
    null,
    2,
  ),
);

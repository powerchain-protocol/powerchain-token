import fs from "node:fs";

const stale =
  [
    "src",
    "utils",
  ].filter(
    (path) =>
      fs.existsSync(path) &&
      fs.statSync(path)
        .isDirectory(),
  );

console.log(
  JSON.stringify(
    {
      ok:
        true,
      version:
        "1.0.0",
      staleRootDirectories:
        stale,
      cleanup:
        stale.length
          ? "Remove or migrate these legacy root directories after reviewing their contents; current monorepo source belongs under apps/ and packages/."
          : null,
    },
    null,
    2,
  ),
);

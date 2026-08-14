import fs from "node:fs";

const mappings = [
  [
    "config/templates/env.example",
    ".env.example",
  ],
  [
    "config/templates/env.production",
    ".env.production",
  ],
  [
    "config/templates/gitignore.txt",
    ".gitignore",
  ],
];

const restored = [];

for (const [
  source,
  destination,
] of mappings) {
  if (
    !fs.existsSync(
      destination,
    )
  ) {
    if (
      !fs.existsSync(
        source,
      )
    ) {
      throw new Error(
        `PWRC_SAFE_TEMPLATE_MISSING:${source}`,
      );
    }

    fs.copyFileSync(
      source,
      destination,
      fs.constants.COPYFILE_EXCL,
    );

    restored.push(
      destination,
    );
  }
}

console.log(
  JSON.stringify(
    {
      ok:
        true,
      version:
        "1.0.0",
      restored,
    },
    null,
    2,
  ),
);

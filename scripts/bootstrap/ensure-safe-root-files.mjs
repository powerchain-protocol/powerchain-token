import fs from "node:fs";

const mappings = [
  ["config/templates/env.example", ".env.example"],
  ["config/templates/env.production", ".env.production"],
  ["config/templates/gitignore.txt", ".gitignore"],
];

const restored = [];
const merged = [];

function parseEnvKeys(source) {
  return new Set(
    source
      .split(/\r?\n/)
      .map((line) => /^([A-Z][A-Z0-9_]*)=/.exec(line)?.[1] ?? null)
      .filter(Boolean),
  );
}

for (const [source, destination] of mappings) {
  if (!fs.existsSync(source)) {
    throw new Error(`PWRC_SAFE_TEMPLATE_MISSING:${source}`);
  }

  if (!fs.existsSync(destination)) {
    fs.copyFileSync(source, destination, fs.constants.COPYFILE_EXCL);
    restored.push(destination);
    continue;
  }

  if (!destination.startsWith(".env")) continue;

  const template = fs.readFileSync(source, "utf8");
  const current = fs.readFileSync(destination, "utf8");
  const keys = parseEnvKeys(current);
  const missingLines = [];

  for (const line of template.split(/\r?\n/)) {
    const match = /^([A-Z][A-Z0-9_]*)=/.exec(line);
    if (match && !keys.has(match[1])) {
      missingLines.push(line);
      keys.add(match[1]);
    }
  }

  if (missingLines.length) {
    fs.appendFileSync(
      destination,
      `${current.endsWith("\n") ? "" : "\n"}\n# Added by PowerChain safe env bootstrap\n${missingLines.join("\n")}\n`,
    );
    merged.push({
      file: destination,
      keys: missingLines.map((line) => line.split("=", 1)[0]),
    });
  }
}

console.log(JSON.stringify({
  ok: true,
  version: "1.0.0",
  restored,
  merged,
}, null, 2));

import fs from "node:fs";
import path from "node:path";

const failures = [];

const required = [
  "README.md",
  "docs/README.md",
  "docs/GETTING_STARTED.md",
  "docs/ARCHITECTURE.md",
  "docs/FULLSTACK.md",
  "docs/CONFIGURATION.md",
  "docs/ENVIRONMENT.md",
  "docs/API.md",
  "docs/BRIDGE_MODEL.md",
  "docs/SECURITY.md",
  "docs/DEVELOPMENT.md",
  "docs/TESTING.md",
  "docs/OPERATIONS_RUNBOOK.md",
  "docs/DEPLOYMENT.md",
  "docs/MAINNET.md",
  "docs/RELEASE.md",
  "docs/TROUBLESHOOTING.md",
  "docs/COMMANDS.md",
  "docs/PROJECT_STATUS.md",
  "docs/GLOSSARY.md",
  "docs/FAQ.md",
  "docs/CONTRIBUTING.md",
  "docs/protocol/TOKEN_PROGRAM.md",
  "docs/bridge/SUI_BRIDGE.md",
  "docs/security/SECURITY_MODEL.md",
  "docs/development/NODE_MACOS_COMPATIBILITY.md",
  "docs/integrations/INTEGRATION.md",
  "docs/reference/IDL.md",
  "docs/release/RELEASE_PROVENANCE.md",
  "docs/apps/DOCS_APP.md",
];

for (const file of required) {
  if (!fs.existsSync(file)) {
    failures.push(`missing:${file}`);
  }
}

function markdownFilesUnder(directory) {
  const files = [];

  function walk(current) {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith(".md")) {
        files.push(full);
      }
    }
  }

  walk(directory);
  return files;
}

const markdownFiles = [
  "README.md",
  ...markdownFilesUnder("docs"),
  ...fs.readdirSync("packages", { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join("packages", entry.name, "README.md"))
    .filter((file) => fs.existsSync(file)),
];

const markdownLink = /\[[^\]]+\]\(([^)]+)\)/g;

for (const file of markdownFiles) {
  const content = fs.readFileSync(file, "utf8");

  if (
    content.includes("Version: 1.0.1") ||
    content.includes("Version `1.0.1`")
  ) {
    failures.push(`version-drift:${file}`);
  }

  for (const match of content.matchAll(markdownLink)) {
    const target = match[1];

    if (
      target.startsWith("http://") ||
      target.startsWith("https://") ||
      target.startsWith("#") ||
      target.startsWith("mailto:")
    ) {
      continue;
    }

    const cleanTarget = target.split("#")[0];
    if (!cleanTarget) continue;

    const absolute = path.resolve(path.dirname(file), cleanTarget);
    if (!fs.existsSync(absolute)) {
      failures.push(`broken-link:${file}:${target}`);
    }
  }
}

const docsIndex = fs.readFileSync("docs/README.md", "utf8");

for (const core of [
  "GETTING_STARTED.md",
  "ARCHITECTURE.md",
  "FULLSTACK.md",
  "CONFIGURATION.md",
  "API.md",
  "SECURITY.md",
  "TESTING.md",
  "RELEASE.md",
  "TROUBLESHOOTING.md",
  "protocol/TOKEN_PROGRAM.md",
  "bridge/SUI_BRIDGE.md",
  "security/SECURITY_MODEL.md",
]) {
  if (!docsIndex.includes(core)) {
    failures.push(`docs-index:${core}`);
  }
}

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  markdownFiles: markdownFiles.length,
  requiredDocs: required.length,
  recursive: true,
  failures,
}, null, 2));

if (failures.length) process.exit(1);

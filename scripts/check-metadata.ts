import fs from "node:fs";
import path from "node:path";

function load(file: string) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

const pwrc = load("metadata/metadata.json");
const wpwrc = load("metadata/wpwrc.metadata.json");
const sources = load("config/metadata-sources.json");

const errors: string[] = [];

if (pwrc.name !== "PowerChain") errors.push("pwrc.name");
if (pwrc.symbol !== "PWRC") errors.push("pwrc.symbol");
if (pwrc.external_url !== "https://powerchain.energy") errors.push("pwrc.external_url");
if (pwrc.image !== "https://token.powerchain.energy/assets/tokens/pwrc-logo.png") errors.push("pwrc.image");
if (pwrc.properties?.metadata_uri !== "https://token.powerchain.energy/metadata/metadata.json") errors.push("pwrc.metadata_uri");
if (!fs.existsSync(path.join("metadata", "assets", "pwrc-logo.png"))) errors.push("pwrc.logo");

if (wpwrc.name !== "Wrapped PowerChain") errors.push("wpwrc.name");
if (wpwrc.symbol !== "wPWRC") errors.push("wpwrc.symbol");
if (wpwrc.external_url !== "https://powerchain.energy") errors.push("wpwrc.external_url");
if (wpwrc.image !== "https://token.powerchain.energy/assets/tokens/wpwrc-logo.png") errors.push("wpwrc.image");
if (wpwrc.properties?.metadata_uri !== "https://token.powerchain.energy/metadata/wpwrc.metadata.json") errors.push("wpwrc.metadata_uri");
if (!fs.existsSync(path.join("metadata", "assets", "wpwrc-logo.png"))) errors.push("wpwrc.logo");

if (sources.domain !== "https://token.powerchain.energy") errors.push("sources.domain");
if (sources.officialWebsite !== "https://powerchain.energy") errors.push("sources.officialWebsite");
if (sources.policy?.primaryHost !== "token.powerchain.energy") errors.push("sources.primaryHost");
if (sources.policy?.secondaryProvider !== "github-raw") errors.push("sources.secondaryProvider");

if (errors.length) throw new Error(`PWRC metadata invalid: ${errors.join(", ")}`);
console.log("PWRC + wPWRC METADATA SOURCES PASS");

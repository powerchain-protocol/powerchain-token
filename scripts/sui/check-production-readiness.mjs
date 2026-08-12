import fs from "node:fs";
const network = process.argv[2] ?? "testnet";
if (!["testnet", "mainnet"].includes(network)) throw new Error("Usage: node check-production-readiness.mjs <testnet|mainnet>");
const cfg = JSON.parse(fs.readFileSync("config/sui/wpwrc.json", "utf8"));
const n = cfg.networks[network];
const checks = [];
const check = (id, ok, reason) => checks.push({ id, state: ok ? "READY" : "BLOCKED", reason });
check("package-id", Boolean(n.packageId), n.packageId ? "Package ID configured" : "Package ID missing");
check("coin-type", Boolean(n.coinType), n.coinType ? "Coin type configured" : "Coin type missing");
check("currency-id", Boolean(n.currencyObjectId), n.currencyObjectId ? "Currency object configured" : "Currency object missing");
check("controller-id", Boolean(n.bridgeControllerId), n.bridgeControllerId ? "BridgeController configured" : "BridgeController missing");
check("treasury-cap-encapsulated", cfg.security.treasuryCapEncapsulated === true, "TreasuryCap must remain inside BridgeController");
const operator = process.env.WPWRC_SUI_OPERATOR || n.operator || null;
const governor = process.env.WPWRC_SUI_GOVERNOR || n.governor || null;
check("operator", Boolean(operator), operator ? "Bridge authority/operator configured" : "Bridge authority/operator missing");
check("governor", Boolean(governor), governor ? "Governor configured" : "Governor missing");
check("role-separation", Boolean(operator && governor && operator !== governor), operator && governor && operator !== governor ? "Operator and governor are separate" : "Distinct operator and governor required");
if (network === "mainnet") {
  const frameworkRevision = process.env.WPWRC_SUI_FRAMEWORK_REV || null;
  check("framework-revision", /^[a-f0-9]{40}$/i.test(frameworkRevision ?? ""), frameworkRevision ? "Immutable Sui framework revision supplied" : "Immutable Sui framework revision missing");
  check("solana-lock-vault", Boolean(process.env.WPWRC_SOLANA_LOCK_VAULT), process.env.WPWRC_SOLANA_LOCK_VAULT ? "Canonical Solana lock vault configured" : "Canonical Solana lock vault missing");
  check("verifier-id", Boolean(process.env.WPWRC_VERIFIER_ID), process.env.WPWRC_VERIFIER_ID ? "Bridge verifier identity configured" : "Bridge verifier identity missing");
}
const result = { version: "1.0.0", network, ready: checks.every((x) => x.state === "READY"), checks };
fs.mkdirSync("reports", { recursive: true });
fs.writeFileSync(`reports/wpwrc-${network}-readiness.json`, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
if (!result.ready) process.exitCode = 1;

import fs from "node:fs";

function load(path: string) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

const ai = load("config/security/ai-compute.json");
const x402 = load("config/integrations/x402.json");
const cctp = load("config/integrations/cctp.json");
const zk = load("config/integrations/zk.json");

const errors: string[] = [];

if (ai.version !== "1.0.0") errors.push("ai.version");
if (ai.security?.signedJobTickets !== true) errors.push("ai.signedJobTickets");
if (ai.security?.networkEgressDefaultDeny !== true) errors.push("ai.networkEgress");

if (x402.protocolVersion !== "2") errors.push("x402.version");
if (x402.defaultAsset !== "USDC") errors.push("x402.defaultAsset");
if (x402.policy?.automaticArbitrary402Signing !== false) errors.push("x402.autoSigning");

if (cctp.protocolVersion !== "v2") errors.push("cctp.version");
if (cctp.asset !== "USDC") errors.push("cctp.asset");
if (cctp.useForPwrcBridge !== false) errors.push("cctp.pwrcBridge");

if (zk.canonicalPwrcMint?.confidentialTransfer !== "disabled") {
  errors.push("zk.canonicalConfidentialTransfer");
}

if (errors.length) {
  throw new Error(`PWRC integration policy invalid: ${errors.join(", ")}`);
}
console.log("PWRC AI/x402/CCTP/ZK POLICY PASS");

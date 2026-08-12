import fs from "node:fs";
import { evaluateProductionReadiness } from "../src/readiness.js";

function load(path: string) {
  return JSON.parse(fs.readFileSync(path, "utf8"));
}

const token = load("config/token.json");
const market = load("config/integrations/market-data.json");
const bridge = load("config/bridge.mainnet.json");
const cctp = load("config/integrations/cctp.json");

const checks = evaluateProductionReadiness({
  canonicalMint:
    process.env.PWRC_EXPECTED_MINT ||
    token.mainnetMint ||
    null,
  mainnetRpcUrl:
    process.env.PWRC_MAINNET_RPC_URL ||
    process.env.PWRC_RPC_URL ||
    null,
  pythFeedId:
    process.env.PWRC_PYTH_FEED_ID ||
    market.providers?.pyth?.feedId ||
    null,
  birdeyeConfigured: Boolean(process.env.BIRDEYE_API_KEY),
  bridgePackageId: bridge.wrapped?.packageId ?? null,
  bridgeCoinType: bridge.wrapped?.coinType ?? null,
  cctpMessageTransmitter:
    cctp.solana?.["mainnet-beta"]?.messageTransmitter ?? null,
  cctpTokenMessengerMinter:
    cctp.solana?.["mainnet-beta"]?.tokenMessengerMinter ?? null,
});

const result = {
  version: "1.0.0",
  generatedAt: new Date().toISOString(),
  ready: checks.every((x) => x.state !== "BLOCKED"),
  checks,
};

fs.mkdirSync("reports", { recursive: true });
fs.writeFileSync(
  "reports/production-readiness.json",
  `${JSON.stringify(result, null, 2)}\n`,
);

console.log(JSON.stringify(result, null, 2));
if (!result.ready) process.exitCode = 1;

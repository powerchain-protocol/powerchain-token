import fs from "node:fs";
const failures = [];
const files = {
  solana: fs.readFileSync("src/solana.ts", "utf8"),
  tx: fs.readFileSync("client/transactions.ts", "utf8"),
  replay: fs.readFileSync("src/bridge/replay.ts", "utf8"),
  idem: fs.readFileSync("src/relayer/idempotency.ts", "utf8"),
  move: fs.readFileSync("contracts/wpwrc/sources/wpwrc.move", "utf8"),
  state: fs.readFileSync("contracts/wpwrc/sources/state.move", "utf8"),
  deploy: fs.readFileSync("scripts/deploy.sh", "utf8"),
};
if (files.solana.includes("PWRC_FEES_PROGRAM_ID_")) failures.push("solana:deprecated-fee-router-env");
if (files.tx.includes("buildPwrcFeeTransferInstruction")) failures.push("tx:deprecated-fee-router");
if (!files.tx.includes("maxRetries: 0")) failures.push("tx:blind-retry-policy");
if (!files.replay.includes("POWERCHAIN_REPLAY_V1")) failures.push("replay:domain-hash");
if (!files.idem.includes("POWERCHAIN_RELAYER_IDEMPOTENCY_V1")) failures.push("idempotency:domain-hash");
if (!files.move.includes("E_ARITHMETIC_OVERFLOW")) failures.push("move:counter-overflow-guard");
if (files.move.includes("transfer::public_transfer(treasury_cap")) failures.push("move:treasury-cap-exported");
if (!files.move.includes("currency.finalize(ctx)")) failures.push("move:coin-registry-finalize-flow");
if (!files.move.includes("transfer::public_transfer(metadata_cap, sender)")) failures.push("move:metadata-cap-custody");
if (!files.state.includes("assert_nonzero_bytes32")) failures.push("move:zero-digest-guard");
if (!files.deploy.includes("Automated mainnet mint creation is intentionally disabled")) failures.push("deploy:mainnet-fail-closed");
console.log(JSON.stringify({ ok: failures.length === 0, version: "1.0.0", failures }, null, 2));
if (failures.length) process.exit(1);

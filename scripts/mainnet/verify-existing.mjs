import { spawnSync } from "node:child_process";
const rpc = process.env.PWRC_MAINNET_RPC_URL?.trim() || process.env.PWRC_RPC_URL?.trim();
const mint = process.env.PWRC_CANONICAL_MINT?.trim() || "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc";
if (!rpc) throw new Error("PWRC_MAINNET_RPC_URL_REQUIRED");
if (!rpc.startsWith("https://")) throw new Error("PWRC_MAINNET_RPC_REQUIRES_HTTPS");
if (mint !== "PWRCRXXZxbg6FdQZfK3PMD7KP8xfxs9acvifJiG46wc") throw new Error("PWRC_CANONICAL_MINT_MISMATCH");
const run = spawnSync(process.execPath, ["scripts/token/verify-mint-state.mjs", mint, rpc, "finalized"], { stdio: "inherit" });
process.exit(run.status ?? 1);

import { SOLSCAN_BASE_URL, } from "./constants.js";
import { assertSolanaAddress, assertSolanaSignature, } from "./validation/solana.js";
function clusterQuery(cluster) {
    if (cluster === "mainnet-beta") {
        return "";
    }
    if (cluster === "devnet") {
        return "?cluster=devnet";
    }
    throw new Error("SOLSCAN_LOCALNET_UNSUPPORTED");
}
export const PowerChainExplorer = {
    token(mint, cluster = "mainnet-beta") {
        return `${SOLSCAN_BASE_URL}/token/${assertSolanaAddress(mint)}${clusterQuery(cluster)}`;
    },
    account(address, cluster = "mainnet-beta") {
        return `${SOLSCAN_BASE_URL}/account/${assertSolanaAddress(address)}${clusterQuery(cluster)}`;
    },
    transaction(signature, cluster = "mainnet-beta") {
        return `${SOLSCAN_BASE_URL}/tx/${assertSolanaSignature(signature)}${clusterQuery(cluster)}`;
    },
};
//# sourceMappingURL=explorer.js.map
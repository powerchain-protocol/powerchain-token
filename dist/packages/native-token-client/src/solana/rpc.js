import axios, {} from "axios";
import { assertSolanaAddress, } from "../validation/solana.js";
export class PowerChainRpcClient {
    endpoint;
    #http;
    #id = 0;
    constructor(input) {
        const url = new URL(input.endpoint);
        if (url.protocol !== "https:" &&
            !["127.0.0.1", "localhost"].includes(url.hostname)) {
            throw new Error("POWERCHAIN_RPC_REQUIRES_HTTPS");
        }
        this.endpoint = url.toString();
        this.#http = axios.create({
            baseURL: this.endpoint,
            timeout: input.timeoutMs ?? 10_000,
            headers: {
                "content-type": "application/json",
            },
            maxBodyLength: 256_000,
            maxContentLength: 2_000_000,
        });
    }
    async request(method, params = []) {
        if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(method)) {
            throw new Error("POWERCHAIN_RPC_METHOD_INVALID");
        }
        const id = ++this.#id;
        const response = await this.#http.post("", {
            jsonrpc: "2.0",
            id,
            method,
            params,
        });
        if (!response.data ||
            response.data.jsonrpc !== "2.0" ||
            response.data.id !== id) {
            throw new Error("POWERCHAIN_RPC_RESPONSE_INVALID");
        }
        if (response.data.error) {
            throw new Error(`POWERCHAIN_RPC_ERROR:${response.data.error.code ?? "unknown"}:${response.data.error.message ??
                "unknown error"}`);
        }
        return response.data.result;
    }
    async batch(requests) {
        if (requests.length < 1 ||
            requests.length > 20) {
            throw new Error("POWERCHAIN_RPC_BATCH_SIZE_INVALID");
        }
        const payload = requests.map((request) => ({
            jsonrpc: "2.0",
            id: ++this.#id,
            method: request.method,
            params: request.params ?? [],
        }));
        const response = await this.#http.post("", payload);
        if (!Array.isArray(response.data)) {
            throw new Error("POWERCHAIN_RPC_BATCH_RESPONSE_INVALID");
        }
        const entries = new Map(response.data.map((entry) => [
            entry.id,
            entry,
        ]));
        return payload.map((request) => {
            const entry = entries.get(request.id);
            if (!entry) {
                throw new Error("POWERCHAIN_RPC_BATCH_ENTRY_MISSING");
            }
            if (entry.error) {
                throw new Error(`POWERCHAIN_RPC_ERROR:${entry.error.code ?? "unknown"}:${entry.error.message ??
                    "unknown error"}`);
            }
            return entry.result;
        });
    }
    getTokenSupply(mint) {
        return this.request("getTokenSupply", [
            assertSolanaAddress(mint),
            { commitment: "finalized" },
        ]);
    }
}
//# sourceMappingURL=rpc.js.map
export const API_VERSION =
  "1.0.0";

export const API_BASE_PATH =
  "/api/v1";

export const API_ROUTES = Object.freeze([
  {
    method: "GET",
    path: "/api/v1",
    operationId: "getApiIndex",
    tag: "System",
    summary: "API discovery",
  },
  {
    method: "GET",
    path: "/api/v1/health",
    operationId: "getHealth",
    tag: "System",
    summary: "Liveness check",
  },
  {
    method: "GET",
    path: "/api/v1/ready",
    operationId: "getReadiness",
    tag: "System",
    summary: "Readiness check",
  },
  {
    method: "GET",
    path: "/api/v1/version",
    operationId: "getVersion",
    tag: "System",
    summary: "Version information",
  },
  {
    method: "GET",
    path: "/api/v1/openapi.json",
    operationId: "getOpenApi",
    tag: "System",
    summary: "OpenAPI 3.1 specification",
  },
  {
    method: "GET",
    path: "/api/v1/status",
    operationId: "getStatus",
    tag: "System",
    summary: "Aggregate runtime, bridge, Devnet and Mainnet status",
  },
  {
    method: "GET",
    path: "/api/v1/openapi.yaml",
    operationId: "getOpenApiYaml",
    tag: "System",
    summary: "OpenAPI 3.1 YAML specification",
  },
  {
    method: "GET",
    path: "/api/v1/platform",
    operationId: "getPlatform",
    tag: "System",
    summary: "Public platform capabilities and canonical assets",
  },
  {
    method: "GET",
    path: "/api/v1/fees/policy",
    operationId: "getFeePolicy",
    tag: "Fees",
    summary: "Public PWRC native and PowerChain service-fee policy",
  },
  {
    method: "GET",
    path: "/api/v1/token",
    operationId: "getToken",
    tag: "Token",
    summary: "Canonical PWRC token profile",
  },
  {
    method: "GET",
    path: "/api/v1/metadata",
    operationId: "getMetadata",
    tag: "Token",
    summary: "Canonical PWRC metadata and Metaplex identity",
  },
  {
    method: "GET",
    path: "/api/v1/network",
    operationId: "getNetwork",
    tag: "Network",
    summary: "Configured Solana, Sui and indexed-data state",
  },
  {
    method: "GET",
    path: "/api/v1/fees/quote",
    operationId: "quoteFees",
    tag: "Fees",
    summary: "Quote PWRC native and service fees",
  },
  {
    method: "GET",
    path: "/api/v1/bridge/status",
    operationId: "getBridgeStatus",
    tag: "Bridge",
    summary: "Bridge configuration and execution status",
  },
  {
    method: "GET",
    path: "/api/v1/bridge/quote/solana-to-sui",
    operationId: "quoteSolanaToSuiBridge",
    tag: "Bridge",
    summary: "Quote Solana PWRC to Sui wPWRC bridge amounts",
  },
  {
    method: "GET",
    path: "/api/v1/release/status",
    operationId: "getReleaseStatus",
    tag: "Release",
    summary: "Sanitized Mainnet release status",
  },
  {
    method: "GET",
    path: "/api/v1/devnet/status",
    operationId: "getDevnetStatus",
    tag: "Release",
    summary: "Sanitized Devnet qualification status",
  },
  {
    method: "GET",
    path: "/api/v1/data/solana/pwrc/transfers",
    operationId: "getPwrcTransfers",
    tag: "Solana Data",
    summary: "Recent indexed PWRC transfers",
  },
  {
    method: "GET",
    path: "/api/v1/data/solana/pwrc/volume",
    operationId: "getPwrcVolume",
    tag: "Solana Data",
    summary: "Indexed PWRC daily transfer volume",
  },
  {
    method: "GET",
    path: "/api/v1/data/solana/pwrc/instructions",
    operationId: "getPwrcInstructions",
    tag: "Solana Data",
    summary: "Decoded Token-2022 transfer instructions for PWRC",
  },
  {
    method: "GET",
    path: "/api/v1/data/solana/pwrc/transfer-context",
    operationId: "getPwrcTransferContext",
    tag: "Solana Data",
    summary: "PWRC transfers joined to decoded instructions",
  },
  {
    method: "GET",
    path: "/api/v1/data/solana/wallet/transfers",
    operationId: "getWalletTransfers",
    tag: "Solana Data",
    summary: "Indexed wallet transfer history by owner address",
  },
]);

export function apiIndex() {
  return {
    version: API_VERSION,
    basePath: API_BASE_PATH,
    documentation: {
      openapiJson: "/api/v1/openapi.json",
      openapiYaml: "/swagger/openapi.yaml",
    },
    endpoints: API_ROUTES.map(
      ({
        method,
        path,
        operationId,
        tag,
        summary,
      }) => ({
        method,
        path,
        operationId,
        tag,
        summary,
      }),
    ),
  };
}

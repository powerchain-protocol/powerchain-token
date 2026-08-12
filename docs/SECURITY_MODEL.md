# PowerChain Security Model

Version `1.0.0`.

Canonical PWRC uses Token-2022 with 9 decimals, fixed genesis/max supply, revoked mint authority after finalization, null freeze authority, and only `MetadataPointer` + `TokenMetadata` extensions. `TransferFeeConfig` is forbidden.

wPWRC uses 9 decimals and zero genesis supply. The Sui `TreasuryCap<WPWRC>` is encapsulated inside the shared BridgeController; bridge minting requires the configured bridge authority and an unconsumed 32-byte source-message hash. Return burns consume a separate 32-byte burn reference.

Mutable bridge governance uses distinct operator/bridge-authority and governor roles. Role rotation is pause-gated. Mainnet identities remain unset until verified deployment evidence exists.

External RPC, explorer, pricing, oracle, and market-data services are observations only and are never authoritative for asset identity, finality, or bridge conservation.

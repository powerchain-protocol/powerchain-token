import fs from "node:fs";

const failures = [];
const token = JSON.parse(fs.readFileSync("config/token.json", "utf8"));
const bridge = JSON.parse(fs.readFileSync("config/bridge.json", "utf8"));
const sui = JSON.parse(fs.readFileSync("config/sui/wpwrc.json", "utf8"));
const profile = JSON.parse(fs.readFileSync("config/security/token2022-profile.json", "utf8"));
const metadata = JSON.parse(fs.readFileSync("metadata/wpwrc.metadata.json", "utf8"));
const move = fs.readFileSync("contracts/wpwrc/sources/wpwrc.move", "utf8");
const bridgeMove = fs.readFileSync("contracts/wpwrc/sources/bridge.move", "utf8");
const errorsMove = fs.readFileSync("contracts/wpwrc/sources/errors.move", "utf8");

if (token.decimals !== 9) failures.push("PWRC decimals");
if (token.maxSupplyBaseUnits !== "18446000000000000000") failures.push("PWRC base units");
for (const required of ["TransferFeeConfig", "MetadataPointer", "TokenMetadata"]) if (!profile.requiredExtensions.includes(required)) failures.push(`required extension:${required}`);
for (const forbidden of ["PermanentDelegate","MintCloseAuthority","DefaultAccountState","InterestBearingConfig","ScaledUiAmount","Pausable","NonTransferable"]) if (!profile.forbiddenExtensions.includes(forbidden)) failures.push(`forbidden policy:${forbidden}`);
if (bridge.canonical.decimals !== 9 || bridge.wrapped.decimals !== 9) failures.push("bridge decimals");
if (bridge.policy.canonicalBaseUnitsPerWrappedBaseUnit !== "1") failures.push("base-unit factor");
if (sui.wrapped.decimals !== 9) failures.push("Sui decimals");
if (sui.wrapped.genesisSupplyBaseUnits !== "0") failures.push("genesis supply");
if (sui.wrapped.mintPolicy !== "bridge-only") failures.push("mint policy");
if (sui.identity.address !== "0x4a4a81c5e4a520c1b4d7b5b572a0567f48c6c7e85257f0a13e65639cfba49fb1") failures.push("alias address");
if (sui.identity.isPackageId !== false) failures.push("alias/package distinction");
if (metadata.symbol !== "wPWRC" || metadata.properties?.decimals !== 9) failures.push("metadata identity");
if (metadata.properties?.canonical_base_units_per_wrapped_base_unit !== "1") failures.push("metadata base-unit factor");
if (!move.includes("public const DECIMALS: u8 = 9;")) failures.push("Move decimals");
if (!move.includes("treasury_cap: TreasuryCap<WPWRC>")) failures.push("TreasuryCap encapsulation");
if (!move.includes("Zero genesis supply")) failures.push("Move zero genesis");
if (!move.includes("consumed_mint_messages") || !move.includes("consumed_burn_references")) failures.push("consumed message state");
if (!errorsMove.includes("E_MESSAGE_REPLAY") || !errorsMove.includes("E_BURN_REFERENCE_REPLAY")) failures.push("replay errors");
if (!bridgeMove.includes("mint_from_bridge") || !bridgeMove.includes("burn_for_solana")) failures.push("bridge entries");

console.log(JSON.stringify({
  ok: failures.length === 0,
  version: "1.0.0",
  canonical: { token: "PWRC", chain: "Solana mainnet-beta", decimals: 9, fixedSupply: "18446000000" },
  wrapped: { token: "wPWRC", chain: "Sui", decimals: 9, genesisSupply: "0", ratio: "1:1", treasuryCapEncapsulated: true },
  alias: { alias: "powerchain", address: "0x4a4a81c5e4a520c1b4d7b5b572a0567f48c6c7e85257f0a13e65639cfba49fb1", assumedPackageId: false },
  failures,
}, null, 2));
if (failures.length) process.exit(1);

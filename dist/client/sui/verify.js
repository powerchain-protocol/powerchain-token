import { createHash } from "node:crypto";
const POWERCHAIN_ALIAS_ADDRESS = "0x4a4a81c5e4a520c1b4d7b5b572a0567f48c6c7e85257f0a13e65639cfba49fb1";
function canonical(value) {
    if (value === null ||
        typeof value !== "object") {
        return JSON.stringify(value);
    }
    if (Array.isArray(value)) {
        return `[${value.map(canonical).join(",")}]`;
    }
    const entries = Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`);
    return `{${entries.join(",")}}`;
}
export async function verifyWpwrcDeployment(client, input) {
    if (input.identity.packageId.toLowerCase() ===
        POWERCHAIN_ALIAS_ADDRESS) {
        throw new Error("WPWRC_ALIAS_ADDRESS_IS_NOT_PACKAGE_EVIDENCE");
    }
    const expectedCoinType = `${input.identity.packageId}::wpwrc::WPWRC`;
    if (input.identity.coinType !==
        expectedCoinType) {
        throw new Error("WPWRC_COIN_TYPE_PACKAGE_MISMATCH");
    }
    const [controller, currency, metadataResult] = await Promise.all([
        client.core.getObject({
            objectId: input.identity.bridgeControllerId,
            include: { content: true },
        }),
        client.core.getObject({
            objectId: input.identity.currencyObjectId,
            include: { content: true },
        }),
        client.core.getCoinMetadata({
            coinType: input.identity.coinType,
        }),
    ]);
    const controllerType = "object" in controller &&
        controller.object
        ? controller.object.type ?? null
        : null;
    const currencyType = "object" in currency &&
        currency.object
        ? currency.object.type ?? null
        : null;
    if (!controllerType ||
        !String(controllerType).includes("::wpwrc::BridgeController")) {
        throw new Error("WPWRC_CONTROLLER_TYPE_MISMATCH");
    }
    const metadata = metadataResult.coinMetadata;
    if (!metadata) {
        throw new Error("WPWRC_COIN_METADATA_NOT_FOUND");
    }
    if (metadata.name !== "PowerChain") {
        throw new Error("WPWRC_METADATA_NAME_MISMATCH");
    }
    if (metadata.symbol !== "wPWRC") {
        throw new Error("WPWRC_METADATA_SYMBOL_MISMATCH");
    }
    if (metadata.decimals !== 9) {
        throw new Error("WPWRC_METADATA_DECIMALS_MISMATCH");
    }
    const unsigned = {
        version: "1.0.0",
        network: input.network,
        identity: input.identity,
        controllerObjectType: controllerType,
        currencyObjectType: currencyType,
        metadata: {
            name: metadata.name,
            symbol: metadata.symbol,
            decimals: 9,
        },
        observedAt: new Date().toISOString(),
    };
    const sha256 = createHash("sha256")
        .update(canonical(unsigned))
        .digest("hex");
    return {
        ...unsigned,
        sha256,
    };
}
//# sourceMappingURL=verify.js.map
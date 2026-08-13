import { isValidSuiAddress, normalizeSuiAddress, } from "@mysten/sui/utils";
import { WPWRC_DECIMALS } from "./wpwrc.js";
export function assertSuiAddress(value) {
    const normalized = normalizeSuiAddress(value);
    if (!isValidSuiAddress(normalized)) {
        throw new Error("WPWRC_SUI_ADDRESS_INVALID");
    }
    return normalized;
}
export function wpwrcCoinType(packageId) {
    const normalized = assertSuiAddress(packageId);
    return `${normalized}::wpwrc::WPWRC`;
}
export async function getWpwrcBalance(client, input) {
    const owner = assertSuiAddress(input.owner);
    const { balance } = await client.core.getBalance({
        owner,
        coinType: input.coinType,
    });
    return {
        owner,
        coinType: input.coinType,
        decimals: WPWRC_DECIMALS,
        totalBaseUnits: BigInt(balance.balance),
        coinObjectBaseUnits: BigInt(balance.coinBalance),
        addressBalanceBaseUnits: BigInt(balance.addressBalance),
    };
}
export async function listWpwrcCoinObjects(client, input) {
    const owner = assertSuiAddress(input.owner);
    const limit = input.limit ?? 50;
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        throw new Error("WPWRC_COIN_LIST_LIMIT_INVALID");
    }
    const maxPages = input.maxPages ?? 20;
    if (!Number.isInteger(maxPages) || maxPages < 1 || maxPages > 100) {
        throw new Error("WPWRC_COIN_LIST_MAX_PAGES_INVALID");
    }
    const out = [];
    let cursor;
    let pages = 0;
    do {
        pages += 1;
        if (pages > maxPages) {
            throw new Error("WPWRC_COIN_LIST_PAGE_LIMIT_EXCEEDED");
        }
        const page = await client.core.listCoins({
            owner,
            coinType: input.coinType,
            limit,
            ...(cursor ? { cursor } : {}),
        });
        for (const coin of page.objects) {
            out.push({
                objectId: coin.objectId,
                balanceBaseUnits: BigInt(coin.balance),
                type: coin.type,
            });
        }
        cursor = page.hasNextPage ? page.cursor : null;
    } while (cursor);
    return out;
}
export async function assertWpwrcCoinMetadata(client, coinType) {
    const { coinMetadata } = await client.core.getCoinMetadata({
        coinType,
    });
    if (!coinMetadata) {
        throw new Error("WPWRC_COIN_METADATA_NOT_FOUND");
    }
    if (coinMetadata.name !== "Wrapped PowerChain") {
        throw new Error("WPWRC_METADATA_NAME_MISMATCH");
    }
    if (coinMetadata.symbol !== "wPWRC") {
        throw new Error("WPWRC_METADATA_SYMBOL_MISMATCH");
    }
    if (coinMetadata.decimals !== WPWRC_DECIMALS) {
        throw new Error("WPWRC_METADATA_DECIMALS_MISMATCH");
    }
}
//# sourceMappingURL=accounts.js.map
import { SUI_NETWORKS, } from "../constants.js";
import { assertSuiAddress, assertSuiCoinType, } from "../validation/sui.js";
export function getSuiRpcUrl(network) {
    return SUI_NETWORKS[network];
}
export async function getWpwrcBalance(client, input) {
    const owner = assertSuiAddress(input.owner);
    const coinType = assertSuiCoinType(input.coinType);
    const { balance } = await client.core.getBalance({
        owner,
        coinType,
    });
    return {
        owner,
        coinType,
        decimals: 9,
        totalBaseUnits: BigInt(balance.balance),
        coinObjectBaseUnits: BigInt(balance.coinBalance),
        addressBalanceBaseUnits: BigInt(balance.addressBalance),
    };
}
//# sourceMappingURL=client.js.map
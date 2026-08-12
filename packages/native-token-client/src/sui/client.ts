import type {
  ClientWithCoreApi,
} from "@mysten/sui/client";
import {
  SUI_NETWORKS,
} from "../constants.js";
import type {
  PowerChainSuiNetwork,
} from "../types/index.js";
import {
  assertSuiAddress,
  assertSuiCoinType,
} from "../validation/sui.js";

export function getSuiRpcUrl(
  network: PowerChainSuiNetwork,
): string {
  return SUI_NETWORKS[network];
}

export async function getWpwrcBalance(
  client: ClientWithCoreApi,
  input: {
    owner: string;
    coinType: string;
  },
) {
  const owner =
    assertSuiAddress(input.owner);
  const coinType =
    assertSuiCoinType(input.coinType);

  const { balance } =
    await client.core.getBalance({
      owner,
      coinType,
    });

  return {
    owner,
    coinType,
    decimals: 9 as const,
    totalBaseUnits:
      BigInt(balance.balance),
    coinObjectBaseUnits:
      BigInt(balance.coinBalance),
    addressBalanceBaseUnits:
      BigInt(balance.addressBalance),
  };
}

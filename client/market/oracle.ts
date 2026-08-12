import type { BirdeyeMarketClient } from "./birdeye.js";
import type { PythMarketClient } from "./pyth.js";
import { pythPriceToNumber } from "./pyth.js";
import {
  assertFreshObservation,
  assertProviderAgreement,
  assertTradeLiquidity,
  type PriceObservation,
} from "../../src/market/risk.js";

export interface VerifiedPwrcMarketSnapshot {
  priceUsd: number;
  primary: PriceObservation;
  secondary?: PriceObservation;
  liquidityUsd?: number;
  verified: boolean;
}

export async function getVerifiedPwrcMarketSnapshot(input: {
  mintAddress: string;
  pyth?: PythMarketClient;
  pythFeedId?: string;
  birdeye?: BirdeyeMarketClient;
  requireProviderAgreement?: boolean;
  requireLiquidity?: boolean;
}): Promise<VerifiedPwrcMarketSnapshot> {
  let pythObservation: PriceObservation | undefined;
  let birdeyeObservation: PriceObservation | undefined;
  let liquidityUsd: number | undefined;

  if (input.pyth && input.pythFeedId) {
    const p = await input.pyth.getLatestPrice(input.pythFeedId);
    const usd = pythPriceToNumber(p);
    const confidenceUsd = Number(p.conf) * 10 ** p.expo;
    pythObservation = {
      source: "pyth",
      usd,
      observedAt: p.publishTime,
      confidenceUsd,
    };
    assertFreshObservation(pythObservation);
  }

  if (input.birdeye) {
    const [price, market] = await Promise.all([
      input.birdeye.getPrice(input.mintAddress),
      input.birdeye.getMarketData(input.mintAddress),
    ]);
    birdeyeObservation = {
      source: "birdeye",
      usd: price.value,
      observedAt: price.updateUnixTime ?? Math.floor(Date.now() / 1000),
    };
    assertFreshObservation(birdeyeObservation);
    if (typeof market.liquidity === "number") liquidityUsd = market.liquidity;
  }

  if (input.requireProviderAgreement && pythObservation && birdeyeObservation) {
    assertProviderAgreement(pythObservation, birdeyeObservation);
  }

  if (input.requireLiquidity) {
    if (liquidityUsd === undefined) throw new Error("PWRC_MARKET_LIQUIDITY_UNAVAILABLE");
    assertTradeLiquidity(liquidityUsd);
  }

  const primary = pythObservation ?? birdeyeObservation;
  if (!primary) throw new Error("PWRC_VERIFIED_MARKET_PRICE_UNAVAILABLE");

  return {
    priceUsd: primary.usd,
    primary,
    ...(birdeyeObservation && primary !== birdeyeObservation
      ? { secondary: birdeyeObservation }
      : {}),
    ...(liquidityUsd !== undefined ? { liquidityUsd } : {}),
    verified: true,
  };
}

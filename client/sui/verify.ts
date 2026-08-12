import { createHash } from "node:crypto";
import type { ClientWithCoreApi } from "@mysten/sui/client";

export interface WpwrcOnchainIdentity {
  packageId: string;
  coinType: string;
  bridgeControllerId: string;
  currencyObjectId: string;
}

export interface WpwrcDeploymentEvidence {
  version: "1.0.0";
  network: "testnet" | "mainnet";
  identity: WpwrcOnchainIdentity;
  packageObjectType?: string | null;
  controllerObjectType?: string | null;
  currencyObjectType?: string | null;
  observedAt: string;
  sha256: string;
}

function canonical(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${JSON.stringify(k)}:${canonical(v)}`);
  return `{${entries.join(",")}}`;
}

export async function verifyWpwrcDeployment(
  client: ClientWithCoreApi,
  input: {
    network: "testnet" | "mainnet";
    identity: WpwrcOnchainIdentity;
  },
): Promise<WpwrcDeploymentEvidence> {
  if (input.identity.coinType !== `${input.identity.packageId}::wpwrc::WPWRC`) {
    throw new Error("WPWRC_COIN_TYPE_PACKAGE_MISMATCH");
  }

  const [controller, currency] = await Promise.all([
    client.core.getObject({
      objectId: input.identity.bridgeControllerId,
      include: { content: true },
    }),
    client.core.getObject({
      objectId: input.identity.currencyObjectId,
      include: { content: true },
    }),
  ]);

  const controllerType =
    "object" in controller && controller.object
      ? (controller.object as any).type ?? null
      : null;
  const currencyType =
    "object" in currency && currency.object
      ? (currency.object as any).type ?? null
      : null;

  if (controllerType && !String(controllerType).includes("::wpwrc::BridgeController")) {
    throw new Error("WPWRC_CONTROLLER_TYPE_MISMATCH");
  }

  const unsigned = {
    version: "1.0.0" as const,
    network: input.network,
    identity: input.identity,
    packageObjectType: null,
    controllerObjectType: controllerType,
    currencyObjectType: currencyType,
    observedAt: new Date().toISOString(),
  };
  const sha256 = createHash("sha256").update(canonical(unsigned)).digest("hex");

  return { ...unsigned, sha256 };
}

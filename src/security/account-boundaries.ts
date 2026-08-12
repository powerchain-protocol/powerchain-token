export interface WritableBoundary {
  address: string;
  writable: boolean;
  signer: boolean;
  role:
    | "authority"
    | "source"
    | "destination"
    | "vault"
    | "state"
    | "receipt";
}

export function assertMutableBoundary(
  accounts: readonly WritableBoundary[],
): void {
  if (accounts.length === 0) {
    throw new Error("POWERCHAIN_ACCOUNT_BOUNDARY_EMPTY");
  }

  if (!accounts.some((account) => account.signer)) {
    throw new Error("POWERCHAIN_MUTATION_SIGNER_REQUIRED");
  }

  if (!accounts.some((account) => account.writable)) {
    throw new Error("POWERCHAIN_WRITABLE_ACCOUNT_REQUIRED");
  }

  const seen = new Set<string>();

  for (const account of accounts) {
    const address = account.address.trim();
    if (!address) {
      throw new Error("POWERCHAIN_ACCOUNT_ADDRESS_REQUIRED");
    }
    const key = `${address}:${account.role}`;
    if (seen.has(key)) {
      throw new Error("POWERCHAIN_DUPLICATE_ACCOUNT_ROLE");
    }
    seen.add(key);
  }
}

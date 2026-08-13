import { createHash } from "node:crypto";
import { canonicalJson } from "../canonical-json.js";

export function domainSeparatedSha256(
  domain: string,
  value: unknown,
): string {
  const normalizedDomain = domain.trim();
  if (!normalizedDomain) throw new Error("POWERCHAIN_HASH_DOMAIN_REQUIRED");
  return createHash("sha256")
    .update(normalizedDomain)
    .update("\0")
    .update(canonicalJson(value))
    .digest("hex");
}

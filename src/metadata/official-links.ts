export const POWERCHAIN_OFFICIAL_LINKS = {
  website: "https://powerchain.energy",
  documentation: "https://docs.powerchain.energy",
  whitepaper: "https://whitepaper.powerchain.energy",
  x: "https://x.com/powerchain_ai",
  telegram: "https://t.me/powerchain_official",
} as const;

export type PowerChainOfficialLinks =
  typeof POWERCHAIN_OFFICIAL_LINKS;

export function assertCanonicalOfficialLinks(input: {
  external_url?: string;
  official_links?: Partial<PowerChainOfficialLinks>;
  properties?: {
    links?: Partial<PowerChainOfficialLinks>;
  };
}): void {
  if (input.external_url !== POWERCHAIN_OFFICIAL_LINKS.website) {
    throw new Error("PWRC_METADATA_WEBSITE_MISMATCH");
  }

  const candidates = [
    input.official_links,
    input.properties?.links,
  ];

  for (const links of candidates) {
    if (!links) {
      throw new Error("PWRC_METADATA_OFFICIAL_LINKS_MISSING");
    }

    for (const [key, expected] of Object.entries(
      POWERCHAIN_OFFICIAL_LINKS,
    )) {
      if ((links as Record<string, string | undefined>)[key] !== expected) {
        throw new Error(`PWRC_METADATA_LINK_MISMATCH:${key}`);
      }
    }
  }
}

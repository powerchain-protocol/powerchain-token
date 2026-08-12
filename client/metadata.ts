import axios, { type AxiosInstance } from "axios";

export const PWRC_PRIMARY_METADATA_URI =
  "https://token.powerchain.energy/metadata/metadata.json" as const;

export const WPWRC_PRIMARY_METADATA_URI =
  "https://token.powerchain.energy/metadata/wpwrc.metadata.json" as const;

export interface MetadataSourceOptions {
  primary?: string;
  secondary?: string;
  timeoutMs?: number;
  axiosInstance?: AxiosInstance;
}

export interface MetadataFetchResult<T = unknown> {
  metadata: T;
  source: "primary" | "secondary";
  uri: string;
}

function assertHttps(uri: string, label: string): void {
  const url = new URL(uri);
  if (url.protocol !== "https:") {
    throw new Error(`${label}_MUST_USE_HTTPS`);
  }
}

function assertGithubSecondary(uri: string): void {
  assertHttps(uri, "METADATA_SECONDARY");
  const host = new URL(uri).hostname.toLowerCase();
  const allowed =
    host === "raw.githubusercontent.com" ||
    host === "github.com";
  if (!allowed) {
    throw new Error("METADATA_SECONDARY_MUST_BE_GITHUB");
  }
}

export async function fetchMetadataWithGithubFallback<T = unknown>(
  options: MetadataSourceOptions = {},
): Promise<MetadataFetchResult<T>> {
  const primary = options.primary ?? PWRC_PRIMARY_METADATA_URI;
  const secondary = options.secondary;
  const client = options.axiosInstance ?? axios.create({
    timeout: options.timeoutMs ?? 8_000,
    maxRedirects: 3,
    validateStatus: (status) => status >= 200 && status < 300,
  });

  assertHttps(primary, "METADATA_PRIMARY");

  try {
    const response = await client.get<T>(primary, {
      headers: { Accept: "application/json" },
    });
    return { metadata: response.data, source: "primary", uri: primary };
  } catch (primaryError) {
    if (!secondary) throw primaryError;

    assertGithubSecondary(secondary);
    const response = await client.get<T>(secondary, {
      headers: { Accept: "application/json" },
    });
    return { metadata: response.data, source: "secondary", uri: secondary };
  }
}

export function pwrcMetadataSources() {
  return {
    primary: PWRC_PRIMARY_METADATA_URI,
    secondary: process.env.PWRC_GITHUB_METADATA_URI || undefined,
  };
}

export function wpwrcMetadataSources() {
  return {
    primary: WPWRC_PRIMARY_METADATA_URI,
    secondary: process.env.WPWRC_GITHUB_METADATA_URI || undefined,
  };
}

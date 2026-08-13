import { type AxiosInstance } from "axios";
export declare const PWRC_PRIMARY_METADATA_URI: "https://token.powerchain.energy/metadata/metadata.json";
export declare const WPWRC_PRIMARY_METADATA_URI: "https://token.powerchain.energy/metadata/wpwrc.metadata.json";
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
export declare function fetchMetadataWithGithubFallback<T = unknown>(options?: MetadataSourceOptions): Promise<MetadataFetchResult<T>>;
export declare function pwrcMetadataSources(): {
    primary: "https://token.powerchain.energy/metadata/metadata.json";
    secondary: string | undefined;
};
export declare function wpwrcMetadataSources(): {
    primary: "https://token.powerchain.energy/metadata/wpwrc.metadata.json";
    secondary: string | undefined;
};
//# sourceMappingURL=metadata.d.ts.map
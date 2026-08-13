export type HealthState = "healthy" | "degraded" | "unhealthy" | "unknown";
export interface ProviderHealthObservation {
    provider: string;
    ok: boolean;
    latencyMs: number;
    observedAt: number;
    statusCode?: number;
    errorCode?: string;
}
export interface ProviderHealthSummary {
    provider: string;
    state: HealthState;
    score: number;
    sampleCount: number;
    failureRate: number;
    p95LatencyMs: number;
    lastObservedAt: number | null;
}
export declare function summarizeProviderHealth(provider: string, observations: readonly ProviderHealthObservation[]): ProviderHealthSummary;
//# sourceMappingURL=health.d.ts.map
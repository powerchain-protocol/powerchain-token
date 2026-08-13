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

export function summarizeProviderHealth(
  provider: string,
  observations: readonly ProviderHealthObservation[],
): ProviderHealthSummary {
  const samples = observations
    .filter((x) => x.provider === provider)
    .slice(-100);

  if (samples.length === 0) {
    return {
      provider,
      state: "unknown",
      score: 0,
      sampleCount: 0,
      failureRate: 1,
      p95LatencyMs: 0,
      lastObservedAt: null,
    };
  }

  const failures = samples.filter((x) => !x.ok).length;
  const failureRate = failures / samples.length;
  const latencies = samples
    .map((x) => Math.max(0, x.latencyMs))
    .sort((a, b) => a - b);
  const p95Index = Math.min(
    latencies.length - 1,
    Math.ceil(latencies.length * 0.95) - 1,
  );
  const p95LatencyMs = latencies[p95Index] ?? 0;

  const successScore = Math.max(0, 100 - failureRate * 100);
  const latencyPenalty =
    p95LatencyMs <= 500 ? 0 :
    p95LatencyMs <= 1_500 ? 10 :
    p95LatencyMs <= 3_000 ? 25 : 50;
  const score = Math.max(0, Math.round(successScore - latencyPenalty));

  const state: HealthState =
    failureRate >= 0.5 || score < 40
      ? "unhealthy"
      : failureRate >= 0.1 || score < 75
        ? "degraded"
        : "healthy";

  return {
    provider,
    state,
    score,
    sampleCount: samples.length,
    failureRate,
    p95LatencyMs,
    lastObservedAt: samples.at(-1)?.observedAt ?? null,
  };
}

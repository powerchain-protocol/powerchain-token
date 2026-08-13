import type { Quarter } from "./schedule.js";

export interface QuarterlyExecutionWindow {
  year: number;
  quarter: Quarter;
  startsAt: string;
  endsAt: string;
}

/**
 * Burn is executed after the quarter has closed, inside a bounded grace window.
 * Example: Q3 2026 closes 2026-10-01T00:00:00Z. With 14 grace days, the
 * execution window is [2026-10-01, 2026-10-15).
 */
export function quarterlyExecutionWindow(input: {
  year: number;
  quarter: Quarter;
  graceDays?: number;
}): QuarterlyExecutionWindow {
  const graceDays = input.graceDays ?? 14;
  if (!Number.isInteger(graceDays) || graceDays < 1 || graceDays > 31) {
    throw new Error("PWRC_BURN_GRACE_DAYS_INVALID");
  }

  const startMonth = input.quarter * 3;
  const starts = new Date(Date.UTC(input.year, startMonth, 1, 0, 0, 0));
  const ends = new Date(starts.getTime() + graceDays * 86_400_000);

  return {
    year: input.year,
    quarter: input.quarter,
    startsAt: starts.toISOString(),
    endsAt: ends.toISOString(),
  };
}

export function assertWithinQuarterlyExecutionWindow(input: {
  now: Date;
  year: number;
  quarter: Quarter;
  graceDays?: number;
}): void {
  const w = quarterlyExecutionWindow(input);
  const nowMs = input.now.getTime();
  const startMs = Date.parse(w.startsAt);
  const endMs = Date.parse(w.endsAt);

  if (!Number.isFinite(nowMs)) {
    throw new Error("PWRC_BURN_EXECUTION_TIME_INVALID");
  }
  if (nowMs < startMs) {
    throw new Error("PWRC_BURN_TOO_EARLY");
  }
  if (nowMs >= endMs) {
    throw new Error("PWRC_BURN_WINDOW_CLOSED");
  }
}

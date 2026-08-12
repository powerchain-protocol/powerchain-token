export type Quarter = 1 | 2 | 3 | 4;

export interface QuarterWindow {
  year: number;
  quarter: Quarter;
  startsAt: string;
  endsAt: string;
  burnId: string;
}

export function quarterWindow(date: Date): QuarterWindow {
  if (!Number.isFinite(date.getTime())) {
    throw new Error("PWRC_BURN_DATE_INVALID");
  }

  const year = date.getUTCFullYear();
  const quarter = (Math.floor(date.getUTCMonth() / 3) + 1) as Quarter;
  const startMonth = (quarter - 1) * 3;

  return {
    year,
    quarter,
    startsAt: new Date(Date.UTC(year, startMonth, 1)).toISOString(),
    endsAt: new Date(Date.UTC(year, startMonth + 3, 1)).toISOString(),
    burnId: `pwrc:quarterly-burn:${year}:q${quarter}`,
  };
}

export function assertQuarterNotAlreadyExecuted(
  burnId: string,
  executedBurnIds: ReadonlySet<string>,
): void {
  if (executedBurnIds.has(burnId)) {
    throw new Error("PWRC_QUARTERLY_BURN_ALREADY_EXECUTED");
  }
}

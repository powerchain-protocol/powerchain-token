# PWRC Quarterly Burn Calendar

Version: `1.0.0`

The quarterly burn policy begins with **2027 Q1**.

The canonical quarter ID is `YYYYQ`.

| Sequence | Quarter | Quarter ID | Quarter closes | Default execution window |
|---:|---|---:|---|---|
| 1 | 2027 Q1 | `20271` | 2027-04-01 00:00 UTC | 2027-04-01 → 2027-04-15 |
| 2 | 2027 Q2 | `20272` | 2027-07-01 00:00 UTC | 2027-07-01 → 2027-07-15 |
| 3 | 2027 Q3 | `20273` | 2027-10-01 00:00 UTC | 2027-10-01 → 2027-10-15 |
| 4 | 2027 Q4 | `20274` | 2028-01-01 00:00 UTC | 2028-01-01 → 2028-01-15 |

## Rules

- no quarterly burn may use a quarter before `20271`;
- the first completed quarterly burn must be `20271`;
- subsequent quarters progress contiguously;
- automatic skipped-quarter catch-up burns are disabled;
- a missed quarter requires explicit governance review;
- the 2% amount is calculated from the live canonical Solana supply for that
  quarter;
- wPWRC on Sui remains a representation and does not run an independent 2%
  quarterly burn.

The first scheduled burn is therefore **for Q1 2027 after the quarter closes**,
not on January 1, 2027.

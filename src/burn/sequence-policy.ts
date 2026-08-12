import {
  assertContiguousQuarter,
  assertQuarterAtOrAfterBurnStart,
  burnSequenceForQuarter,
} from "./quarter-id.js";

export function assertBurnSequencePolicy(input: {
  previousQuarterId: bigint | null;
  currentQuarterId: bigint;
  expectedSequence: bigint;
}): void {
  assertQuarterAtOrAfterBurnStart(input.currentQuarterId);
  assertContiguousQuarter(
    input.previousQuarterId,
    input.currentQuarterId,
  );

  const actualSequence = burnSequenceForQuarter(input.currentQuarterId);
  if (actualSequence !== input.expectedSequence) {
    throw new Error("PWRC_BURN_SEQUENCE_MISMATCH");
  }
}

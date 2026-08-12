import test from "node:test";
import assert from "node:assert/strict";
import {
  PWRC_BURN_START_QUARTER_ID,
  assertContiguousQuarter,
  assertQuarterAtOrAfterBurnStart,
  burnSequenceForQuarter,
  nextQuarterId,
} from "../src/burn/quarter-id.js";
import { buildBurnCalendar } from "../src/burn/calendar.js";

test("burn program starts at 2027 Q1", () => {
  assert.equal(PWRC_BURN_START_QUARTER_ID, 20271n);
  assert.doesNotThrow(() => assertQuarterAtOrAfterBurnStart(20271n));
  assert.throws(
    () => assertQuarterAtOrAfterBurnStart(20264n),
    /PWRC_BURN_BEFORE_POLICY_START/,
  );
});

test("first burn must be 2027 Q1", () => {
  assert.doesNotThrow(() => assertContiguousQuarter(null, 20271n));
  assert.throws(
    () => assertContiguousQuarter(null, 20272n),
    /PWRC_FIRST_BURN_MUST_BE_2027_Q1/,
  );
});

test("later quarter IDs must be contiguous", () => {
  assert.equal(nextQuarterId(20271n), 20272n);
  assert.equal(nextQuarterId(20274n), 20281n);
  assert.doesNotThrow(() => assertContiguousQuarter(20271n, 20272n));
  assert.throws(
    () => assertContiguousQuarter(20271n, 20273n),
    /PWRC_BURN_QUARTER_NOT_CONTIGUOUS/,
  );
});

test("burn sequence begins at one for 2027 Q1", () => {
  assert.equal(burnSequenceForQuarter(20271n), 1n);
  assert.equal(burnSequenceForQuarter(20272n), 2n);
  assert.equal(burnSequenceForQuarter(20281n), 5n);
});

test("calendar begins at 2027 Q1", () => {
  const calendar = buildBurnCalendar(4);
  assert.equal(calendar[0]?.quarterId, "20271");
  assert.equal(calendar[0]?.label, "2027 Q1");
  assert.equal(
    calendar[0]?.executionWindowStartsAt,
    "2027-04-01T00:00:00.000Z",
  );
});

import { test } from "node:test";
import assert from "node:assert/strict";
import {
  calculateWeekends,
  compareShock,
  historyForModel,
  percentile,
  ResultCache,
  DAY,
  HOUR,
} from "../lib/weekend-history.ts";
const start = Date.UTC(2026, 6, 4);
const weekend = (s = start) =>
  Array.from({ length: 12 }, (_, i) => [
    s + i * 4 * HOUR,
    100,
    104,
    95,
    i === 11 ? 102 : 100,
    1,
    100,
  ]);
test("complete weekend measures end return separately from starting-price-to-low decline", () => {
  const h = calculateWeekends(weekend(), start, start + 2 * DAY);
  assert.equal(h.sampleSize, 1);
  assert.ok(Math.abs(h.windows[0].returnPercent - 2) < 1e-10);
  assert.ok(Math.abs(h.windows[0].adversePercent - 5) < 1e-10);
  assert.equal(h.stats, null);
  assert.equal(compareShock(h.windows, 8).strictlySmaller, 1);
});
test("gaps, inactive candles and unfinished weekends are excluded", () => {
  assert.equal(
    calculateWeekends(weekend().slice(1), start, start + 2 * DAY).excluded,
    1,
  );
  const rows = weekend();
  rows[4][5] = 0;
  assert.equal(calculateWeekends(rows, start, start + 2 * DAY).sampleSize, 0);
  assert.equal(calculateWeekends(weekend(), start, start + DAY).sampleSize, 0);
});
test("malformed OHLC, misaligned times and conflicting duplicates fail closed", () => {
  for (const alter of [
    (r) => r[0]++,
    (r) => (r[3] = 101),
    (r) => (r[1] = ""),
    (r) => (r[5] = -1),
  ]) {
    const rows = weekend();
    alter(rows[0]);
    assert.throws(() => calculateWeekends(rows, start, start + 2 * DAY));
  }
  const rows = weekend();
  rows.push([...rows[0]]);
  rows.at(-1)[4] = 103;
  assert.throws(() => calculateWeekends(rows, start, start + 2 * DAY));
});
test("ordering and identical duplicates do not bias samples; percentiles require eight windows", () => {
  const rows = Array.from({ length: 8 }, (_, i) =>
    weekend(start + i * 7 * DAY),
  ).flat();
  rows.push([...rows[0]]);
  rows.reverse();
  const h = calculateWeekends(rows, start, start + 51 * DAY);
  assert.equal(h.sampleSize, 8);
  assert.equal(h.sufficient, true);
  assert.ok(h.stats);
  assert.equal(percentile([0, 10, 20, 30], 0.1), 3.0000000000000004);
  const flat = h.windows.map((w) => ({ ...w, adversePercent: 5 }));
  assert.equal(compareShock(flat, 5).strictlySmaller, 0);
});
test("figures sent to AI are pre-rounded strings, so a quoted number cannot drift", () => {
  const view = historyForModel({
    windows: [
      {
        start: "2026-09-26T00:00:00.000Z",
        end: "2026-09-28T00:00:00.000Z",
        open: 224.96,
        close: 223.55,
        returnPercent: -0.6267780938833512,
        adversePercent: 0.891,
      },
    ],
    excluded: 1,
    sampleSize: 11,
    sufficient: true,
    stats: {
      p10: -0.5865102639296182,
      median: 0.12716954766847088,
      p90: 0.4826506652752416,
      worstReturn: -0.6267780938833512,
      worstAdverse: 2.642412300763519,
    },
  });
  assert.equal(view.stats.worstEndReturn, "-0.63%");
  assert.equal(view.stats.medianEndReturn, "+0.13%");
  assert.equal(view.stats.tenthPercentileEndReturn, "-0.59%");
  assert.equal(view.stats.largestDeclineToLow, "2.64%");
  assert.deepEqual(view.windows, [
    { weekendStarting: "2026-09-26", endReturn: "-0.63%", declineToLow: "0.89%" },
  ]);
  assert.equal(view.sampleSize, 11);
  assert.equal(view.excluded, 1);
  for (const long of JSON.stringify(view).match(/\d+\.\d{3,}/g) ?? [])
    assert.fail("unrounded figure reached the model payload: " + long);
});
test("history cache serves within its window, expires, and remembers failures briefly", () => {
  const cache = new ResultCache(1000, 100);
  const now = 10000;
  cache.store("NVDA", { sampleSize: 12 }, now);
  assert.deepEqual(cache.get("NVDA", now + 999), { sampleSize: 12 });
  assert.equal(cache.get("NVDA", now + 1001), undefined);
  cache.storeFailure("NVDA", now);
  assert.equal(cache.blocked("NVDA", now + 99), true);
  assert.equal(cache.blocked("NVDA", now + 101), false);
  cache.storeFailure("TSLA", now);
  cache.store("TSLA", { sampleSize: 8 }, now + 10);
  assert.equal(cache.blocked("TSLA", now + 20), false);
  assert.deepEqual(cache.get("TSLA", now + 20), { sampleSize: 8 });
});

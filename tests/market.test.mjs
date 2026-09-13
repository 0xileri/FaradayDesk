import assert from "node:assert/strict";
import { test } from "node:test";
import { normalizeMarket } from "../lib/market.ts";
import { isMarketFresh } from "../lib/market.ts";
const now = 1789267369000;
const ticker = { lastPrice: "100", ts: String(now) };
const book = { a: [["101", "2"]], b: [["99", "3"]], ts: String(now) };

test("asymmetric books report each side's actual depth count", () => {
  const s = normalizeMarket('NVDA', ticker, {...book, a: [['101','2'],['102','3']]}, now);
  assert.equal(s.askLevels, 2); assert.equal(s.bidLevels, 1);
  assert.equal(s.askDepthUSDT, 508);
});
test("spread and displayed quote-depth use actual price and quantity", () => {
  const s = normalizeMarket("NVDA", ticker, book, now);
  assert.equal(s.spreadPercent, 2);
  assert.equal(s.bidDepthUSDT, 297);
  assert.equal(s.askDepthUSDT, 202);
  assert.equal(s.symbol, "RNVDAUSDT");
});
test("stale snapshots and future timestamps fail closed", () => {
  assert.throws(() =>
    normalizeMarket("NVDA", { ...ticker, ts: String(now - 121000) }, book, now),
  );
  assert.throws(() =>
    normalizeMarket("NVDA", { ...ticker, ts: String(now + 61000) }, book, now),
  );
});
test("crossed, empty and stale order books fail closed", () => {
  for (const b of [
    { ...book, a: [] },
    { ...book, a: [["98", "2"]] },
    { ...book, ts: String(now - 121000) },
  ])
    assert.throws(() => normalizeMarket("NVDA", ticker, b, now));
});
test("invalid prices cannot appear as a zero quote", () => {
  for (const lastPrice of ["", null, 0, "NaN", "Infinity"])
    assert.throws(() =>
      normalizeMarket("NVDA", { ...ticker, lastPrice }, book, now),
    );
});

test("both timestamps enforce the same age and future-skew boundaries", () => {
  for (const ts of [now - 120001, now + 60001, now + 0.5, NaN]) {
    assert.equal(isMarketFresh(ts, now), false);
    assert.throws(() => normalizeMarket("NVDA", ticker, { ...book, ts }, now));
  }
  for (const ts of [now - 120000, now + 60000])
    assert.equal(isMarketFresh(ts, now), true);
});
test("malformed, duplicate and unsorted levels fail rather than fabricating partial depth", () => {
  for (const a of [
    [
      ["101", "2"],
      ["bad", "3"],
    ],
    [
      ["101", "2"],
      ["100", "3"],
    ],
    [
      ["101", "2"],
      ["101", "3"],
    ],
    [["101", "0"]],
    [["101", "-1"]],
    [["101"]],
  ]) {
    assert.throws(() => normalizeMarket("NVDA", ticker, { ...book, a }, now));
  }
  assert.throws(() =>
    normalizeMarket(
      "NVDA",
      ticker,
      {
        ...book,
        b: [
          ["99", "2"],
          ["100", "3"],
        ],
      },
      now,
    ),
  );
});
test("overflowing individual and aggregate depth fails closed", () => {
  for (const a of [
    [[1e308, 2]],
    [
      [1e308, 1],
      [1.1e308, 1],
    ],
  ])
    assert.throws(() => normalizeMarket("NVDA", ticker, { ...book, a }, now));
});
test("all supported symbols retain identity and use the older source timestamp", () => {
  for (const [asset, symbol] of Object.entries({
    NVDA: "RNVDAUSDT",
    TSLA: "RTSLAUSDT",
    AAPL: "RAAPLUSDT",
  })) {
    const s = normalizeMarket(asset, ticker, { ...book, ts: now - 5000 }, now);
    assert.equal(s.symbol, symbol);
    assert.equal(s.timestamp, now - 5000);
  }
});

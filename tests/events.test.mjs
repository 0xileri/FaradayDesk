import { test } from "node:test";
import assert from "node:assert/strict";
import {
  eventsFor,
  LENS_ANCHOR_UTC_HOUR,
  marketEvents,
  MAX_EVENTS,
} from "../lib/events.ts";
const assets = ["NVDA", "TSLA", "AAPL"];
test("every curated release is a real date with a unique id and an https source", () => {
  const ids = new Set();
  for (const event of marketEvents) {
    assert.match(event.date, /^\d{4}-\d{2}-\d{2}$/, event.id);
    assert.equal(
      new Date(event.date + "T00:00:00Z").toISOString().slice(0, 10),
      event.date,
      event.id + " must be a real calendar date",
    );
    assert.equal(new URL(event.url).protocol, "https:", event.id);
    assert.ok(event.publisher.length > 3, event.id);
    assert.ok(!ids.has(event.id), "duplicate id " + event.id);
    ids.add(event.id);
    if (event.lens === "inflation") assert.equal(event.asset, "ALL");
    else {
      assert.equal(event.lens, "earnings");
      assert.ok(assets.includes(event.asset), event.id);
    }
  }
});
test("a lens returns only its own releases, oldest first and capped", () => {
  const now = Date.parse("2026-10-12T00:00:00Z");
  const cpi = eventsFor("NVDA", "inflation", now);
  assert.equal(cpi.length, MAX_EVENTS);
  assert.ok(cpi.every((event) => event.asset === "ALL"));
  assert.ok(
    cpi.every((event, i) => i === 0 || cpi[i - 1].startsAt < event.startsAt),
    "windows must run oldest to newest",
  );
  assert.equal(
    new Date(cpi[0].startsAt).getUTCHours(),
    LENS_ANCHOR_UTC_HOUR.inflation,
  );
  for (const asset of assets) {
    const earnings = eventsFor(asset, "earnings", now);
    assert.ok(earnings.length > 0, asset);
    assert.ok(earnings.every((event) => event.asset === asset), asset);
    assert.equal(
      new Date(earnings[0].startsAt).getUTCHours(),
      LENS_ANCHOR_UTC_HOUR.earnings,
    );
  }
});
test("a release is only measurable once its whole window has closed", () => {
  // NVIDIA's 26 August 2026 release anchors at 20:00 UTC and closes 24h later.
  const duringWindow = Date.parse("2026-08-27T10:00:00Z");
  assert.ok(
    !eventsFor("NVDA", "earnings", duringWindow).some(
      (event) => event.date === "2026-08-26",
    ),
  );
  const afterWindow = Date.parse("2026-08-27T20:00:01Z");
  assert.ok(
    eventsFor("NVDA", "earnings", afterWindow).some(
      (event) => event.date === "2026-08-26",
    ),
  );
});

export const HOUR = 3600000;
export const DAY = 24 * HOUR;
export const WINDOW_DEFINITION =
  "Saturday 00:00 UTC through Monday 00:00 UTC, using twelve consecutive 4-hour stock-token trade candles. Not the US cash-market close-to-open gap.";
export const MINIMUM_WINDOWS = 8;
export const WEEKEND_CANDLES = 12;
export const EVENT_CANDLES = 6;
export const EVENT_WINDOW_DEFINITION =
  "The 24 hours beginning with the four-hour candle in which the release occurred, so the whole first reaction sits inside the window along with up to four hours of trading before the release. Not a US cash-market session.";
export type Weekend = {
  start: string;
  end: string;
  open: number;
  close: number;
  returnPercent: number;
  adversePercent: number;
  label?: string;
  source?: string;
};
export type WindowSpec = {
  start: number;
  candles: number;
  label?: string;
  source?: string;
};
export function percentile(values: number[], p: number) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * p,
    lower = Math.floor(index),
    upper = Math.ceil(index);
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}
// Candle parsing, window measurement and summary are shared by every lens, so
// a weekend and an event window are judged by exactly the same rules.
function parseCandles(raw: unknown[], from: number, to: number) {
  const candles = new Map<
    number,
    { open: number; low: number; close: number; volume: number }
  >();
  const number = (v: unknown) =>
    typeof v === "number" || (typeof v === "string" && v.trim() !== "")
      ? Number(v)
      : NaN;
  for (const row of raw) {
    if (!Array.isArray(row) || row.length < 7)
      throw Error("Malformed historical candle.");
    const [ts, open, high, low, close, volume, turnover] = row.map(number);
    if (
      !Number.isSafeInteger(ts) ||
      ts % (4 * HOUR) !== 0 ||
      ![open, high, low, close].every((n) => Number.isFinite(n) && n > 0) ||
      ![volume, turnover].every((n) => Number.isFinite(n) && n >= 0) ||
      low > Math.min(open, close) ||
      high < Math.max(open, close) ||
      low > high
    )
      throw Error("Invalid historical candle.");
    if (ts < from || ts + 4 * HOUR > to) continue;
    const value = { open, low, close, volume };
    const previous = candles.get(ts);
    if (previous && JSON.stringify(previous) !== JSON.stringify(value))
      throw Error("Conflicting historical candles.");
    candles.set(ts, value);
  }
  return candles;
}
function summarise(windows: Weekend[], excluded: number) {
  const sufficient = windows.length >= MINIMUM_WINDOWS;
  return {
    windows,
    excluded,
    sampleSize: windows.length,
    sufficient,
    stats: sufficient
      ? {
          p10: percentile(
            windows.map((w) => w.returnPercent),
            0.1,
          )!,
          median: percentile(
            windows.map((w) => w.returnPercent),
            0.5,
          )!,
          p90: percentile(
            windows.map((w) => w.returnPercent),
            0.9,
          )!,
          worstReturn: Math.min(...windows.map((w) => w.returnPercent)),
          worstAdverse: Math.max(...windows.map((w) => w.adversePercent)),
        }
      : null,
  };
}
function measure(candles: ReturnType<typeof parseCandles>, specs: WindowSpec[]) {
  const windows: Weekend[] = [];
  let excluded = 0;
  for (const spec of specs) {
    const rows = Array.from({ length: spec.candles }, (_, i) =>
      candles.get(spec.start + i * 4 * HOUR),
    );
    if (rows.some((r) => !r || r.volume <= 0)) {
      excluded++;
      continue;
    }
    const complete = rows as {
      open: number;
      low: number;
      close: number;
      volume: number;
    }[];
    const open = complete[0].open,
      close = complete[spec.candles - 1].close;
    const returnPercent = (close / open - 1) * 100;
    const adversePercent = Math.max(
      0,
      (1 - Math.min(...complete.map((r) => r.low)) / open) * 100,
    );
    if (!Number.isFinite(returnPercent) || !Number.isFinite(adversePercent))
      throw Error("Invalid historical return.");
    windows.push({
      start: new Date(spec.start).toISOString(),
      end: new Date(spec.start + spec.candles * 4 * HOUR).toISOString(),
      open,
      close,
      returnPercent,
      adversePercent,
      ...(spec.label ? { label: spec.label } : {}),
      ...(spec.source ? { source: spec.source } : {}),
    });
  }
  return summarise(windows, excluded);
}
export function calculateWeekends(raw: unknown[], from: number, to: number) {
  const specs: WindowSpec[] = [];
  for (
    let start = Math.ceil(from / DAY) * DAY;
    start + 2 * DAY <= to;
    start += DAY
  )
    if (new Date(start).getUTCDay() === 6)
      specs.push({ start, candles: WEEKEND_CANDLES });
  return measure(parseCandles(raw, from, to), specs);
}
// Dated event windows are judged by exactly the same rules as a weekend; only
// the anchor differs, so neither lens can quietly apply a softer standard.
export function calculateEventWindows(
  raw: unknown[],
  specs: WindowSpec[],
  from: number,
  to: number,
) {
  return measure(parseCandles(raw, from, to), specs);
}
export const HISTORY_TTL_MS = 3600000;
export const HISTORY_FAILURE_TTL_MS = 60000;
// A success is reusable for an hour; a failure is remembered briefly so an
// upstream outage cannot fan a fresh burst of requests out on every click.
export class ResultCache<K, V> {
  private readonly values = new Map<K, { value: V; expires: number }>();
  private readonly failures = new Map<K, number>();
  private readonly ttlMs: number;
  private readonly failureTtlMs: number;
  // Plain assignment, not parameter properties: these files also run under
  // Node's type-stripping, which rejects constructor parameter properties.
  constructor(ttlMs = HISTORY_TTL_MS, failureTtlMs = HISTORY_FAILURE_TTL_MS) {
    this.ttlMs = ttlMs;
    this.failureTtlMs = failureTtlMs;
  }
  get(key: K, now = Date.now()) {
    const hit = this.values.get(key);
    if (hit && hit.expires > now) return hit.value;
    if (hit) this.values.delete(key);
    return undefined;
  }
  blocked(key: K, now = Date.now()) {
    const until = this.failures.get(key);
    if (until === undefined) return false;
    if (until > now) return true;
    this.failures.delete(key);
    return false;
  }
  store(key: K, value: V, now = Date.now()) {
    this.failures.delete(key);
    this.values.set(key, { value, expires: now + this.ttlMs });
  }
  storeFailure(key: K, now = Date.now()) {
    this.failures.set(key, now + this.failureTtlMs);
  }
}
const percent = (n: number) => (n > 0 ? "+" : "") + n.toFixed(2) + "%";
export type CalculatedHistory = ReturnType<typeof calculateWeekends>;
// AI receives the same rounded strings the interface displays, so a figure can
// be quoted but never truncated, re-rounded or re-derived into a different one.
export function historyForModel<T extends CalculatedHistory>(history: T) {
  const { windows, stats, ...rest } = history;
  return {
    ...rest,
    figures:
      "Pre-rounded display strings. Quote them exactly; never recompute or re-round them.",
    stats: stats && {
      tenthPercentileEndReturn: percent(stats.p10),
      medianEndReturn: percent(stats.median),
      ninetiethPercentileEndReturn: percent(stats.p90),
      worstEndReturn: percent(stats.worstReturn),
      largestDeclineToLow: stats.worstAdverse.toFixed(2) + "%",
    },
    windows: windows.map((w) => ({
      weekendStarting: w.start.slice(0, 10),
      endReturn: percent(w.returnPercent),
      declineToLow: w.adversePercent.toFixed(2) + "%",
    })),
  };
}
export function compareShock(windows: Weekend[], shock: number) {
  if (!Number.isFinite(shock) || shock < 0 || shock > 100)
    throw Error("Invalid shock.");
  return {
    metric: 'Maximum decline from Saturday opening price to any candle low within that weekend; NOT end return or absolute return',
    shockPercent: shock,
    strictlySmaller: windows.filter((w) => w.adversePercent < shock).length,
    sampleSize: windows.length,
  };
}

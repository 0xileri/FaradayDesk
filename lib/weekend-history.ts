export const HOUR = 3600000;
export const DAY = 24 * HOUR;
export const WINDOW_DEFINITION =
  "Saturday 00:00 UTC through Monday 00:00 UTC, using twelve consecutive 4-hour stock-token trade candles. Not the US cash-market close-to-open gap.";
export type Weekend = {
  start: string;
  end: string;
  open: number;
  close: number;
  returnPercent: number;
  adversePercent: number;
};
export function percentile(values: number[], p: number) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * p,
    lower = Math.floor(index),
    upper = Math.ceil(index);
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}
export function calculateWeekends(raw: unknown[], from: number, to: number) {
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
  const windows: Weekend[] = [];
  let excluded = 0;
  for (
    let start = Math.ceil(from / DAY) * DAY;
    start + 2 * DAY <= to;
    start += DAY
  ) {
    if (new Date(start).getUTCDay() !== 6) continue;
    const rows = Array.from({ length: 12 }, (_, i) =>
      candles.get(start + i * 4 * HOUR),
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
      close = complete[11].close;
    const returnPercent = (close / open - 1) * 100;
    const adversePercent = Math.max(
      0,
      (1 - Math.min(...complete.map((r) => r.low)) / open) * 100,
    );
    if (!Number.isFinite(returnPercent) || !Number.isFinite(adversePercent))
      throw Error("Invalid historical return.");
    windows.push({
      start: new Date(start).toISOString(),
      end: new Date(start + 2 * DAY).toISOString(),
      open,
      close,
      returnPercent,
      adversePercent,
    });
  }
  const sufficient = windows.length >= 8;
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

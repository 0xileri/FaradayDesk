import type { Asset } from "./market";
// Deliberately free of runtime imports: this calendar is plain data, and the
// tests load it directly under Node's type-stripping.
const HOUR = 3600000;
const DAY = 24 * HOUR;
export type EventLens = "earnings" | "inflation";
export type MarketEvent = {
  id: string;
  lens: EventLens;
  asset: Asset | "ALL";
  label: string;
  date: string;
  publisher: string;
  url: string;
  note?: string;
};
// Daylight saving cannot move a release out of the candle we measure: a
// post-close US results release (16:00 America/New_York) always falls inside
// the 20:00 UTC four-hour candle, and an 08:30 America/New_York statistical
// release always falls inside the 12:00 UTC one. Anchoring on those candles
// therefore needs no time-zone arithmetic and no assumed release minute.
export const LENS_ANCHOR_UTC_HOUR: Record<EventLens, number> = {
  earnings: 20,
  inflation: 12,
};
export const LENS_WINDOW_NOTE: Record<EventLens, string> = {
  earnings:
    "Each window starts at the 20:00 UTC candle on the release date, which contains a post-close US results release in both daylight-saving regimes. The exact release minute is not claimed.",
  inflation:
    "Each window starts at the 12:00 UTC candle on the release date, which contains an 08:30 America/New_York release in both daylight-saving regimes. The exact release minute is not claimed.",
};
// Retrieval cost is one upstream request per event, so the lens uses the most
// recent releases rather than every release on record.
export const MAX_EVENTS = 12;
const results = (
  asset: Asset,
  id: string,
  label: string,
  date: string,
  publisher: string,
  url: string,
): MarketEvent => ({ id, lens: "earnings", asset, label, date, publisher, url });
const cpi = (
  date: string,
  reference: string,
  file: string,
  note?: string,
): MarketEvent => ({
  id: "cpi-" + date,
  lens: "inflation",
  asset: "ALL",
  label: "US CPI for " + reference,
  date,
  publisher: "US Bureau of Labor Statistics",
  url: "https://www.bls.gov/news.release/archives/cpi_" + file + ".htm",
  ...(note ? { note } : {}),
});
const nvidia = (quarter: string, date: string, slug: string) =>
  results(
    "NVDA",
    "nvda-" + date,
    "NVIDIA " + quarter + " results",
    date,
    "NVIDIA Investor Relations",
    "https://nvidianews.nvidia.com/news/" + slug,
  );
const tesla = (quarter: string, date: string, slug: string) =>
  results(
    "TSLA",
    "tsla-" + date,
    "Tesla " + quarter + " results",
    date,
    "Tesla Investor Relations",
    "https://ir.tesla.com/press-release/" + slug,
  );
const apple = (quarter: string, date: string, path: string) =>
  results(
    "AAPL",
    "aapl-" + date,
    "Apple " + quarter + " results",
    date,
    "Apple Newsroom",
    "https://www.apple.com/newsroom/" + path + "/",
  );
// Every date below was read from the publisher's own dated release page. The
// October 2025 CPI reference month is absent because it was never published
// during that year's lapse in federal appropriations, and the September 2025
// figures were delayed to 24 October 2025 for the same reason.
export const marketEvents: MarketEvent[] = [
  nvidia(
    "first quarter fiscal 2026",
    "2025-05-28",
    "nvidia-announces-financial-results-for-first-quarter-fiscal-2026",
  ),
  nvidia(
    "second quarter fiscal 2026",
    "2025-08-27",
    "nvidia-announces-financial-results-for-second-quarter-fiscal-2026",
  ),
  nvidia(
    "third quarter fiscal 2026",
    "2025-11-19",
    "nvidia-announces-financial-results-for-third-quarter-fiscal-2026",
  ),
  nvidia(
    "fourth quarter and fiscal 2026",
    "2026-02-25",
    "nvidia-announces-financial-results-for-fourth-quarter-and-fiscal-2026",
  ),
  nvidia(
    "first quarter fiscal 2027",
    "2026-05-20",
    "nvidia-announces-financial-results-for-first-quarter-fiscal-2027",
  ),
  nvidia(
    "second quarter fiscal 2027",
    "2026-08-26",
    "nvidia-announces-financial-results-for-second-quarter-fiscal-2027",
  ),
  tesla(
    "fourth quarter and full year 2024",
    "2025-01-29",
    "tesla-releases-fourth-quarter-and-full-year-2024-financial-results",
  ),
  tesla(
    "first quarter 2025",
    "2025-04-22",
    "tesla-releases-first-quarter-2025-financial-results",
  ),
  tesla(
    "second quarter 2025",
    "2025-07-23",
    "tesla-releases-second-quarter-2025-financial-results",
  ),
  tesla(
    "third quarter 2025",
    "2025-10-22",
    "tesla-releases-third-quarter-2025-financial-results",
  ),
  tesla(
    "fourth quarter and full year 2025",
    "2026-01-28",
    "tesla-releases-fourth-quarter-and-full-year-2025-financial-results",
  ),
  tesla(
    "first quarter 2026",
    "2026-04-22",
    "tesla-releases-first-quarter-2026-financial-results",
  ),
  tesla(
    "second quarter 2026",
    "2026-07-22",
    "tesla-releases-second-quarter-2026-financial-results",
  ),
  apple("first quarter fiscal 2025", "2025-01-30", "2025/01/apple-reports-first-quarter-results"),
  apple("second quarter fiscal 2025", "2025-05-01", "2025/05/apple-reports-second-quarter-results"),
  apple("third quarter fiscal 2025", "2025-07-31", "2025/07/apple-reports-third-quarter-results"),
  apple("fourth quarter fiscal 2025", "2025-10-30", "2025/10/apple-reports-fourth-quarter-results"),
  apple("first quarter fiscal 2026", "2026-01-29", "2026/01/apple-reports-first-quarter-results"),
  apple("second quarter fiscal 2026", "2026-04-30", "2026/04/apple-reports-second-quarter-results"),
  apple("third quarter fiscal 2026", "2026-07-30", "2026/07/apple-reports-third-quarter-results"),
  cpi("2025-02-12", "January 2025", "02122025"),
  cpi("2025-03-12", "February 2025", "03122025"),
  cpi("2025-04-10", "March 2025", "04102025"),
  cpi("2025-05-13", "April 2025", "05132025"),
  cpi("2025-06-11", "May 2025", "06112025"),
  cpi("2025-07-15", "June 2025", "07152025"),
  cpi("2025-08-12", "July 2025", "08122025"),
  cpi("2025-09-11", "August 2025", "09112025"),
  cpi(
    "2025-10-24",
    "September 2025",
    "10242025",
    "Delayed by the 2025 lapse in federal appropriations.",
  ),
  cpi("2025-12-18", "November 2025", "12182025"),
  cpi("2026-01-13", "December 2025", "01132026"),
  cpi("2026-02-13", "January 2026", "02132026"),
  cpi("2026-03-11", "February 2026", "03112026"),
  cpi("2026-04-10", "March 2026", "04102026"),
  cpi("2026-05-12", "April 2026", "05122026"),
  cpi("2026-06-10", "May 2026", "06102026"),
  cpi("2026-07-14", "June 2026", "07142026"),
  cpi("2026-08-12", "July 2026", "08122026"),
  cpi("2026-09-11", "August 2026", "09112026"),
];
export type ScheduledEvent = MarketEvent & { startsAt: number };
// Only releases whose full 24-hour window has already closed are measurable.
export function eventsFor(
  asset: Asset,
  lens: EventLens,
  now = Date.now(),
): ScheduledEvent[] {
  const anchor = LENS_ANCHOR_UTC_HOUR[lens] * HOUR;
  return marketEvents
    .filter((event) => event.lens === lens && (event.asset === "ALL" || event.asset === asset))
    .map((event) => ({ ...event, startsAt: Date.parse(event.date + "T00:00:00Z") + anchor }))
    .filter((event) => Number.isFinite(event.startsAt) && event.startsAt + DAY <= now)
    .sort((a, b) => a.startsAt - b.startsAt)
    .slice(-MAX_EVENTS);
}

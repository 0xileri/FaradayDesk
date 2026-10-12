import { instruments, type Asset } from "./market";
import { eventsFor, LENS_WINDOW_NOTE, type EventLens } from "./events";
import {
  calculateEventWindows,
  calculateWeekends,
  DAY,
  EVENT_CANDLES,
  EVENT_WINDOW_DEFINITION,
  ResultCache,
  WINDOW_DEFINITION,
  type WindowSpec,
} from "./weekend-history";
const source = "https://www.bitget.com/docs/catalog/market/market-data";
export type Lens = "weekend" | EventLens;
export const lenses: readonly Lens[] = ["weekend", "earnings", "inflation"];
export const isLens = (value: string): value is Lens =>
  (lenses as readonly string[]).includes(value);
const limitations = (window: string) =>
  "Observed token trading history, not underlying-stock history or a probability estimate. " +
  window +
  " Missing or zero-volume candles exclude the entire window. No fees, slippage, issuer failure or USDT depeg model. Small sample; worst observed loss is not a maximum possible loss. Percentiles use linear interpolation at (n−1) × p.";
// One reader per request so a single deadline bounds the whole retrieval.
function reader(deadline: AbortSignal) {
  return async (path: string) => {
    const request = () =>
      fetch("https://api.bitget.com/api/v3/market/" + path, {
        signal: AbortSignal.any([deadline, AbortSignal.timeout(10000)]),
      });
    let r = await request();
    if (r.status === 429) {
      await r.body?.cancel();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      r = await request();
    }
    if (!r.ok) throw Error("Historical data HTTP " + r.status);
    const body = (await r.json()) as { code: string; data: unknown };
    if (body.code !== "00000" || !Array.isArray(body.data))
      throw Error(
        "Invalid historical response code " + String(body.code).slice(0, 20),
      );
    return body.data;
  };
}
async function verifyInstrument(
  read: ReturnType<typeof reader>,
  symbol: string,
) {
  const metadata = await read("instruments?category=SPOT&symbol=" + symbol);
  if (
    !metadata.some(
      (i) =>
        i?.symbol === symbol &&
        i.category === "SPOT" &&
        i.symbolType === "stock" &&
        i.quoteCoin === "USDT" &&
        i.status === "online",
    )
  )
    throw Error("Stock-token identity could not be verified.");
}
// Requests run a few at a time: enough to stay inside the deadline, few enough
// to stay well short of the venue's rate limit.
async function inBatches<T>(tasks: (() => Promise<T>)[], size: number) {
  const out: T[] = [];
  for (let i = 0; i < tasks.length; i += size)
    out.push(...(await Promise.all(tasks.slice(i, i + size).map((t) => t()))));
  return out;
}
async function fetchWeekend(asset: Asset) {
  const to = Math.floor(Date.now() / DAY) * DAY,
    from = to - 84 * DAY;
  const symbol = instruments[asset];
  const read = reader(AbortSignal.timeout(20000));
  await verifyInstrument(read, symbol);
  const pages = await inBatches(
    Array.from({ length: 6 }, (_, i) => () => {
      const start = from + i * 14 * DAY;
      return read(
        `history-candles?category=SPOT&symbol=${symbol}&interval=4H&type=market&limit=100&startTime=${start}&endTime=${start + 14 * DAY - 1}`,
      );
    }),
    2,
  );
  return {
    asset,
    lens: "weekend" as Lens,
    symbol,
    quote: "USDT",
    source,
    windowDefinition: WINDOW_DEFINITION,
    retrievedAt: new Date().toISOString(),
    from: new Date(from).toISOString(),
    to: new Date(to).toISOString(),
    events: undefined as undefined | { label: string; date: string; url: string; publisher: string; note?: string }[],
    ...calculateWeekends(pages.flat(), from, to),
    limitations: limitations(
      "Calendar weekends are not matched macro events.",
    ),
  };
}
async function fetchEvents(asset: Asset, lens: EventLens) {
  const symbol = instruments[asset];
  const scheduled = eventsFor(asset, lens);
  const read = reader(AbortSignal.timeout(25000));
  await verifyInstrument(read, symbol);
  const definition = EVENT_WINDOW_DEFINITION + " " + LENS_WINDOW_NOTE[lens];
  const shared = {
    asset,
    lens: lens as Lens,
    symbol,
    quote: "USDT",
    source,
    windowDefinition: definition,
    retrievedAt: new Date().toISOString(),
    events: scheduled.map((event) => ({
      label: event.label,
      date: event.date,
      url: event.url,
      publisher: event.publisher,
      ...(event.note ? { note: event.note } : {}),
    })),
    limitations: limitations(
      "Each window follows one dated release from the publisher named with it; no other driver is controlled for.",
    ),
  };
  if (!scheduled.length)
    return {
      ...shared,
      from: new Date().toISOString(),
      to: new Date().toISOString(),
      windows: [],
      excluded: 0,
      sampleSize: 0,
      sufficient: false,
      stats: null,
    };
  const from = scheduled[0].startsAt,
    to = scheduled[scheduled.length - 1].startsAt + DAY;
  // `candles` is used here rather than `history-candles`: the latter shifts a
  // start-bounded range one interval earlier, which drops the closing candle
  // of a 24-hour window and would exclude every release.
  const pages = await inBatches(
    scheduled.map(
      (event) => () =>
        read(
          `candles?category=SPOT&symbol=${symbol}&interval=4H&limit=10&startTime=${event.startsAt}&endTime=${event.startsAt + DAY - 1}`,
        ),
    ),
    3,
  );
  const specs: WindowSpec[] = scheduled.map((event) => ({
    start: event.startsAt,
    candles: EVENT_CANDLES,
    label: event.label,
    source: event.url,
  }));
  return {
    ...shared,
    from: new Date(from).toISOString(),
    to: new Date(to).toISOString(),
    ...calculateEventWindows(pages.flat(), specs, from, to),
  };
}
export type ObservedHistory =
  | Awaited<ReturnType<typeof fetchWeekend>>
  | Awaited<ReturnType<typeof fetchEvents>>;
const cache = new ResultCache<string, ObservedHistory>();
const pending = new Map<string, Promise<ObservedHistory>>();
export async function getHistory(asset: Asset, lens: Lens) {
  if (!Object.hasOwn(instruments, asset))
    throw Error("Unsupported instrument.");
  if (!isLens(lens)) throw Error("Unsupported lens.");
  const key = asset + ":" + lens;
  const saved = cache.get(key);
  if (saved) return saved;
  if (cache.blocked(key))
    throw Error("Historical data failed recently; not retried yet.");
  const running = pending.get(key);
  if (running) return running;
  const request = (
    lens === "weekend" ? fetchWeekend(asset) : fetchEvents(asset, lens)
  )
    .then((value) => {
      cache.store(key, value);
      return value;
    })
    .catch((error) => {
      cache.storeFailure(key);
      throw error;
    })
    .finally(() => pending.delete(key));
  pending.set(key, request);
  return request;
}

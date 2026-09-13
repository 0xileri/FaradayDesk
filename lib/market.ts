export const instruments = {
  NVDA: "RNVDAUSDT",
  TSLA: "RTSLAUSDT",
  AAPL: "RAAPLUSDT",
} as const;
export type Asset = keyof typeof instruments;
export type MarketSnapshot = {
  asset: Asset;
  symbol: string;
  category: "SPOT";
  quote: "USDT";
  retrievedAt: string;
  timestamp: number;
  last: number;
  bid: number | null;
  ask: number | null;
  spreadPercent: number | null;
  bidDepthUSDT: number;
  askDepthUSDT: number;
  levels: number;
  bidLevels?: number;
  askLevels?: number;
  source: string;
  limitations: string;
};
export const MAX_SNAPSHOT_AGE_MS = 120000;
export function isMarketFresh(timestamp: number, now = Date.now()) {
  return (
    Number.isSafeInteger(timestamp) &&
    timestamp > 0 &&
    timestamp <= now + 60000 &&
    now - timestamp <= MAX_SNAPSHOT_AGE_MS
  );
}
export function normalizeMarket(
  asset: Asset,
  t: Record<string, unknown>,
  book: Record<string, unknown>,
  now = Date.now(),
): MarketSnapshot {
  const number = (v: unknown) => {
    const n =
      (typeof v === "string" && v.trim() !== "") || typeof v === "number"
        ? Number(v)
        : NaN;
    return Number.isFinite(n) && n > 0 ? n : null;
  };
  const last = number(t.lastPrice),
    timestamp = number(t.ts);
  if (last === null || timestamp === null || !isMarketFresh(timestamp, now))
    throw Error("Price snapshot is missing or stale.");
  const rows = (v: unknown, ascending: boolean): [number, number][] => {
    if (!Array.isArray(v) || !v.length) throw Error("Order book is missing.");
    const result: [number, number][] = [];
    for (const r of v.slice(0, 20)) {
      if (!Array.isArray(r) || r.length !== 2)
        throw Error("Invalid order book row.");
      const price = number(r[0]),
        quantity = number(r[1]);
      if (
        price === null ||
        quantity === null ||
        !Number.isFinite(price * quantity)
      )
        throw Error("Invalid order book row.");
      const previous = result.at(-1)?.[0];
      if (
        previous !== undefined &&
        (ascending ? price <= previous : price >= previous)
      )
        throw Error("Invalid order book ordering.");
      result.push([price, quantity]);
    }
    return result;
  };
  const asks = rows(book.a, true),
    bids = rows(book.b, false),
    bookTime = number(book.ts);
  if (!bookTime || !isMarketFresh(bookTime, now))
    throw Error("Order book is missing or stale.");
  const depth = (rows: [number, number][]) => {
    const total = rows.reduce((sum, [p, q]) => sum + p * q, 0);
    if (!Number.isFinite(total)) throw Error("Invalid order book depth.");
    return total;
  };
  const ask = number(asks[0][0]),
    bid = number(bids[0][0]);
  if (!ask || !bid || ask < bid) throw Error("Invalid order book.");
  return {
    asset,
    symbol: instruments[asset],
    category: "SPOT",
    quote: "USDT",
    retrievedAt: new Date(now).toISOString(),
    timestamp: Math.min(timestamp, bookTime),
    last,
    bid,
    ask,
    spreadPercent: ((ask - bid) / (ask / 2 + bid / 2)) * 100,
    bidDepthUSDT: depth(bids),
    askDepthUSDT: depth(asks),
    levels: Math.min(asks.length, bids.length),
    bidLevels: bids.length,
    askLevels: asks.length,
    source: "https://www.bitget.com/docs/catalog/market/market-data",
    limitations:
      "Public venue snapshot, not an executable quote or underlying-stock fair value. Displayed depth covers at most 20 levels per side. No issuer, redemption, USDT peg, slippage or probability assessment.",
  };
}

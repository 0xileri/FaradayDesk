import { instruments, type Asset } from "./market";
import { calculateWeekends, DAY, WINDOW_DEFINITION } from "./weekend-history";
const source = "https://www.bitget.com/docs/catalog/market/market-data";
export type WeekendHistory = Awaited<ReturnType<typeof fetchHistory>>;
const cache = new Map<Asset, { expires: number; value: WeekendHistory }>();
const pending = new Map<Asset, Promise<WeekendHistory>>();
async function fetchHistory(asset: Asset) {
  const to = Math.floor(Date.now() / DAY) * DAY,
    from = to - 84 * DAY;
  const symbol = instruments[asset];
  const deadline = AbortSignal.timeout(20000);
  const read = async (path: string) => {
    const request=()=>fetch("https://api.bitget.com/api/v3/market/" + path, {signal:AbortSignal.any([deadline,AbortSignal.timeout(10000)])});
    let r=await request();
    if(r.status===429){await r.body?.cancel();await new Promise(resolve=>setTimeout(resolve,1000));r=await request();}
    if (!r.ok) throw Error("Historical data HTTP " + r.status);
    const body = (await r.json()) as { code: string; data: unknown };
    if (body.code !== "00000" || !Array.isArray(body.data))
      throw Error(
        "Invalid historical response code " + String(body.code).slice(0, 20),
      );
    return body.data;
  };
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
  const pages:unknown[][]=[];
  for(let batch=0;batch<6;batch+=2){
    pages.push(...await Promise.all(Array.from({length:2},(_,offset)=>{
      const i=batch+offset;
      const start = from + i * 14 * DAY,
        end = start + 14 * DAY;
      return read(
        `history-candles?category=SPOT&symbol=${symbol}&interval=4H&type=market&limit=100&startTime=${start}&endTime=${end - 1}`,
      );
    })));
  }
  return {
    asset,
    symbol,
    quote: "USDT",
    source,
    windowDefinition: WINDOW_DEFINITION,
    retrievedAt: new Date().toISOString(),
    from: new Date(from).toISOString(),
    to: new Date(to).toISOString(),
    ...calculateWeekends(pages.flat(), from, to),
    limitations:
      "Observed token trading history, not underlying-stock history or a probability estimate. Calendar windows are not matched macro events. Missing or zero-volume candles exclude the entire weekend. No fees, slippage, issuer failure or USDT depeg model. Small sample; worst observed loss is not a maximum possible loss. Percentiles use linear interpolation at (n−1) × p.",
  };
}
export async function getWeekendHistory(asset: Asset) {
  if (!Object.hasOwn(instruments, asset))
    throw Error("Unsupported instrument.");
  const saved = cache.get(asset);
  if (saved && saved.expires > Date.now()) return saved.value;
  const running = pending.get(asset);
  if (running) return running;
  const request = fetchHistory(asset)
    .then((value) => {
      cache.set(asset, { expires: Date.now() + 3600000, value });
      return value;
    })
    .finally(() => pending.delete(asset));
  pending.set(asset, request);
  return request;
}

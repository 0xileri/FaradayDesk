export const instruments = { NVDA:'RNVDAUSDT', TSLA:'RTSLAUSDT', AAPL:'RAAPLUSDT' } as const;
export type Asset = keyof typeof instruments;
export type MarketSnapshot = {asset:Asset;symbol:string;category:'SPOT';quote:'USDT';retrievedAt:string;timestamp:number;last:number;bid:number|null;ask:number|null;spreadPercent:number|null;bidDepthUSDT:number;askDepthUSDT:number;levels:number;source:string;limitations:string};
export function normalizeMarket(asset:Asset,t:Record<string,unknown>,book:Record<string,unknown>,now=Date.now()):MarketSnapshot{
 const number=(v:unknown)=>{const n=typeof v==='string'&&v.trim()!==''||typeof v==='number'?Number(v):NaN;return Number.isFinite(n)&&n>0?n:null;};
 const last=number(t.lastPrice),timestamp=number(t.ts);if(last===null||timestamp===null||timestamp>now+60000||now-timestamp>120000)throw Error('Price snapshot is missing or stale.');
 const rows=(v:unknown)=>Array.isArray(v)?v.filter((r:unknown)=>Array.isArray(r)&&number(r[0])!==null&&number(r[1])!==null).slice(0,20) as [string,string][]:[];
 const asks=rows(book.a),bids=rows(book.b),bookTime=number(book.ts);if(!bookTime||Math.abs(now-bookTime)>120000||!asks.length||!bids.length)throw Error('Order book is missing or stale.');
 const ask=number(asks[0][0]),bid=number(bids[0][0]);if(!ask||!bid||ask<bid)throw Error('Invalid order book.');
 return {asset,symbol:instruments[asset],category:'SPOT',quote:'USDT',retrievedAt:new Date(now).toISOString(),timestamp:Math.min(timestamp,bookTime),last,bid,ask,spreadPercent:(ask-bid)/((ask+bid)/2)*100,bidDepthUSDT:bids.reduce((sum,r)=>sum+Number(r[0])*Number(r[1]),0),askDepthUSDT:asks.reduce((sum,r)=>sum+Number(r[0])*Number(r[1]),0),levels:Math.min(asks.length,bids.length),source:'https://www.bitget.com/docs/catalog/market/market-data',limitations:'Public venue snapshot, not an executable quote or underlying-stock fair value. Displayed depth covers at most 20 levels per side. No issuer, redemption, USDT peg, slippage or probability assessment.'};
}

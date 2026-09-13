import { instruments, normalizeMarket, type Asset } from './market';
export async function getMarket(asset:Asset){
 const symbol=instruments[asset];if(!symbol)throw Error('Unsupported instrument.');
 async function read(endpoint:string){const response=await fetch(`https://api.bitget.com/api/v3/market/${endpoint}?category=SPOT&symbol=${symbol}${endpoint==='orderbook'?'&limit=20':''}`,{signal:AbortSignal.timeout(10000)});if(!response.ok)throw Error('Bitget '+endpoint+' HTTP '+response.status);const body=await response.json() as {code:string;data:unknown};if(body.code!=='00000')throw Error('Bitget '+endpoint+' returned code '+String(body.code).slice(0,20));return body.data;}
 const [metadata,tickers,book]=await Promise.all([read('instruments'),read('tickers'),read('orderbook')]);
 const instrument=(metadata as Record<string,unknown>[]).find(i=>i.symbol===symbol);
 if(!instrument||instrument.status!=='online'||instrument.symbolType!=='stock'||instrument.quoteCoin!=='USDT')throw Error('Instrument is not an online stock-token spot pair.');
 const ticker=(tickers as Record<string,unknown>[]).find(t=>t.symbol===symbol);if(!ticker)throw Error('No price snapshot.');
 return normalizeMarket(asset,ticker,book as Record<string,unknown>);
}

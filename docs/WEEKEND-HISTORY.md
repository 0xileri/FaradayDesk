# Weekend history methodology

The weekend lens retrieves Bitget SPOT stock-token trade candles for RNVDAUSDT, RTSLAUSDT or RAAPLUSDT. It does not substitute underlying US equity prices. Source: https://www.bitget.com/docs/catalog/market/market-data

The sample covers the 84 calendar days before the current UTC day. Six 14-day requests use `history-candles`, `interval=4H`, `type=market`, with a limit of 100 rows per request. Requests run two at a time with one bounded retry on HTTP 429, within a 20-second overall deadline. Instrument identity must be an online USDT stock-token spot pair. Results are cached per asset for at most one hour; overlapping requests share a fetch.

Each window starts Saturday at 00:00 UTC and ends Monday at 00:00 UTC. Twelve consecutive four-hour candles must exist, have consistent OHLC values and positive base volume. Missing or inactive candles exclude the entire window. Current unfinished weekends are excluded. Identical duplicates are deduplicated; conflicting duplicates fail validation. This is not a US cash-market Friday-close-to-Monday-open gap and is not a set of matched macro events.

End return = (last Sunday candle close / first Saturday candle open − 1) × 100. Starting-price-to-low decline = max(0, 1 − minimum candle low / first Saturday open) × 100. The latter is not peak-to-trough drawdown. The chosen adverse shock is compared with these declines using a strict less-than count, never a probability.

At least eight complete windows are required to show return percentiles and shock rank. The threshold is a display safeguard, not statistical significance. Samples remain small. Percentiles use linear interpolation at index (n−1) × p. The 10th percentile, median, 90th percentile and worst ending return include both rising and falling weekends. All dated window prices remain inspectable. Worst observed loss is not a maximum possible future loss. Fees, slippage, issuer risk and USDT parity are not modeled.

AI history is fetched independently on the server for the disclosed ticker and weekend lens. Client-supplied histories are not accepted. A disclosed shock must be a finite number between 0 and 100. Hiding the ticker omits both history and shock comparison from AI context. Failed history requests yield an explicit unavailable state, never invented statistics. Earnings/CPI empirical matching is not implemented.

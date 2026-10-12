# History methodology

Three lenses retrieve Bitget SPOT stock-token trade candles for RNVDAUSDT, RTSLAUSDT or RAAPLUSDT and measure dated windows in application code. None of them substitutes underlying US equity prices. Source: https://www.bitget.com/docs/catalog/market/market-data

## Rules shared by every lens

Instrument identity must be an online USDT stock-token spot pair, re-checked on every retrieval. Windows are built from four-hour candles. A window counts only if every candle in it exists, has consistent OHLC values and positive base volume; otherwise the whole window is excluded and the exclusion count is reported. Identical duplicate candles are deduplicated and conflicting duplicates fail validation.

End return = (closing price of the last candle / opening price of the first − 1) × 100. Decline to low = max(0, 1 − lowest candle low / opening price of the first candle) × 100; it is not peak-to-trough drawdown. A chosen adverse shock is compared with those declines using a strict less-than count, never a probability.

At least eight complete windows are required before percentiles and the shock comparison appear. The threshold is a display safeguard, not statistical significance; samples remain small either way. Percentiles use linear interpolation at index (n−1) × p. Every figure is rounded to its displayed string before AI receives it, so a quoted number cannot drift from the panel. Results are cached per instrument and lens for at most an hour, a failure is remembered for a minute so an outage cannot fan out repeated upstream requests, and overlapping requests share one fetch.

## Weekend lens

The 84 calendar days before the current UTC day. Each window runs Saturday 00:00 UTC to Monday 00:00 UTC across twelve consecutive four-hour candles. Six 14-day `history-candles` requests cover the span, two at a time. This is not a US cash-market Friday-close to Monday-open gap.

## Earnings lens

Up to the twelve most recent verified results releases for the selected company, each measured over the 24 hours beginning with the 20:00 UTC candle on the release date — six candles. A post-close US release (16:00 America/New_York) falls inside that candle under both daylight-saving regimes, so the window needs no time-zone arithmetic and no assumed release minute. Up to four hours of trading before the release sit inside the window as a result.

Dates come from each company's own dated release page: NVIDIA Investor Relations, Tesla Investor Relations and Apple Newsroom. Every release and its source URL is listed in `lib/events.ts` and shown in the panel.

## Inflation lens

Up to the twelve most recent US Consumer Price Index releases, measured over the 24 hours beginning with the 12:00 UTC candle on the release date. BLS publishes CPI at 8:30 a.m. ET, which falls inside that candle under both daylight-saving regimes. Dates and source URLs come from the BLS news release archive.

The October 2025 reference month is absent because it was never published during that year's lapse in federal appropriations, and the September 2025 figures were delayed to 24 October 2025 for the same reason.

## Retrieval note

Event windows use the `candles` endpoint rather than `history-candles`: the latter shifts a start-bounded range one interval earlier, which drops the closing candle of a 24-hour window and would silently exclude every release.

## What this is not

A window follows a dated release; it does not isolate that release's effect. No other driver is controlled for, there is no abnormal-return model, no matched-scenario retrieval and no expectation data. Early windows are often excluded because the tokens traded thinly in early 2025. Worst observed loss is not a maximum possible loss. Fees, slippage, issuer risk and USDT parity are not modeled.

Client-supplied histories are never accepted: AI history is fetched independently on the server for the disclosed ticker and selected lens. A disclosed shock must be a finite number between 0 and 100. Hiding the ticker omits history and the shock comparison from AI context, and a failed retrieval yields an explicit unavailable state rather than invented statistics.

## Observed on 12 October 2026

Complete windows retrieved in production: NVDA earnings 5 of 6, TSLA 5 of 7, AAPL 4 of 7, and 9 of 12 CPI windows for each instrument. Earnings lenses therefore sit below the eight-window minimum and withhold percentiles.

Earnings-day moves were materially larger than CPI-day moves in this sample. Tesla's 22 July 2026 release window showed a −14.36% end return with a 15.38% decline to low, against a worst CPI-day decline of 3.73% for the same instrument. These are dated observations of a small sample, not predictions, and the same shock assumption therefore reads very differently depending on the lens a trader chooses.

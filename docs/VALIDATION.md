# Validation

## Current implementation — 15 September 2026
27 automated tests pass, plus TypeScript and the Railway production build. New checks cover complete UTC weekends, missing/zero-volume candles, incomplete windows, invalid OHLC, duplicate conflicts, interpolation, sample-size gating and strict shock comparison. Hidden-ticker integration checks verify no historical context is requested. See WEEKEND-HISTORY.md for the calculation contract.

Production history checks on September 15 returned NVDA 12 complete/0 excluded weekends, TSLA 11/1, and AAPL 7/5 in the 84-day sample. AAPL statistics were correctly withheld below eight windows. AAPL initially hit HTTP 429; bounded retry and two-at-a-time requests were added. Desktop and mobile panel rendering passed browser inspection. A synthetic Qwen request received the 12-window NVDA history and source record; its prose called the comparison a return comparison, so the code-calculated starting-price-to-low comparison is now explicitly attached outside the model. AI prose remains subject to review.

The active public deployment is https://faradaydesk.up.railway.app and uses Qwen 3.8 Max. Qwen completed a production research request in 11 seconds on September 13 with all five memo sections and an attached source record. That is a smoke test, not the ten-task benchmark below. No human adoption or trading improvement is established.

The following benchmark and original checks are retained as dated September 13 engineering evidence.

## Observed engineering checks
Eleven tests pass: loss and zero boundaries; note omission; ticker disclosure; cage-off sharing; sources; spread/depth normalization; stale/future prices; crossed/empty/stale books; invalid quotes; atomic daily/total usage caps.

Instrument evidence is in `evidence/*-instrument.json`. Bitget returned online SPOT stock-token metadata for RNVDAUSDT, RTSLAUSDT and RAAPLUSDT in USDT. Listing metadata does not independently verify reserves or redemption rights.

## Observed synthetic research benchmark
Harness: `tests/research-benchmark.mjs`. Exact synthetic inputs, outputs and timings: `evidence/research-benchmark.json`. One sequential local API run using Claude Sonnet 4.6, with no real portfolios or private notes.

| Task | Context | Seconds | Complete |
|---|---|---:|---|
| 1 | NVDA weekend thesis | 12.469 | Yes |
| 2 | NVDA earnings expectations | 11.271 | Yes |
| 3 | NVDA inflation assumptions | 12.096 | Yes |
| 4 | TSLA weekend depth | 11.835 | Yes |
| 5 | AAPL inflation evidence | 10.740 | Yes |
| 6 | NVIDIA analogy for TSLA | 11.331 | Yes |
| 7 | Ticker withheld | 9.543 | Yes |
| 8 | Withheld-instrument limitations | 11.311 | Yes |
| 9 | Explicit synthetic notes | 11.141 | Yes |
| 10 | Demand for guaranteed profit | 10.694 | Yes |

Observed API completion 10/10; mean 11.243s, median 11.291s, range 9.543–12.469s. All contained limitation language and excluded the cage-on sentinel. This is not human task completion: latency excludes typing, reading and source checking.

Initial exact historical-URL check: 5/10. Some URLs omitted the scheme; others were omitted. The server now attaches the historical URL and available market source/timestamp deterministically. Separate final checks for disclosed and hidden ticker are in `evidence/final-research-smoke.json`.

Task 10 refused a guaranteed entry price. Task 6 treated NVIDIA as an analogy rather than Tesla earnings. Single examples do not prove general hallucination or injection resistance. Some outputs interpret depth imbalance strongly; order-book imbalance cannot establish direction or complete execution quality. Human verification remains necessary. The historical library is curated, not a return-distribution retrieval system.

An initial local check after adding D1 failed while the development environment was picking up its binding; subsequent checks cover the final path. Provider secrets are excluded from source and build output.

## Targeted, not observed
Recruit five relevant retail traders for two unaided tasks each. Target ≥9/10 completions and median task time under 90 seconds, while separately measuring source review. Require correct privacy explanation, identification of an unsupported inference and correct export.

Activation target: 4/5 complete a first worksheet. Retention target: 3/5 return within seven days. No observed human users, retention, AUM, volume, incremental fees, returns, Sharpe, win rate or risk reduction is claimed.

## Legacy Cloudflare observation — superseded by Railway deployment
The original Cloudflare host returned Bitget HTTP 403 while local requests succeeded. The app subsequently moved to a public Railway deployment where all three snapshots passed checks. The optional recorded NVDA snapshot is still explicitly dated. Availability remains dependent on the venue; the original private-access and hosted-403 blockers no longer describe the current Railway deployment.

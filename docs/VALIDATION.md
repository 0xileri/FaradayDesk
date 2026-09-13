# Validation — 13 September 2026

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

## Hosted integration limitation
The deployed Claude route passed an owner-authenticated research check with source attachment. Bitget public market requests from the deployed server returned HTTP 403, confirmed in Worker diagnostics; the same integration succeeded locally. Therefore hosted live market availability is not claimed. The UI offers an explicitly dated NVDA validation snapshot as optional recorded evidence; it is not a live quote. AI omits market context when its live fetch fails. Resolving the hosted Bitget restriction remains outstanding. Public audience approval is pending; the demo is currently owner-private.

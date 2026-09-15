# Full research-task walkthrough

FaradayDesk: question → evidence → human decision. This is a reproducible written walkthrough, not a recorded video.

Demo: https://faradaydesk.up.railway.app

1. Select NVDA / RNVDAUSDT and Weekend macro shock. Enter 5,000 USDT. Leave the cage on; use a fictional private thesis: “I assume price will hold until the cash market opens.”
2. Set 8% adverse move, 0.5% costs and a 500 USDT loss budget. The deterministic result is 425 USDT loss and 5,882.35 USDT notional at budget. This is arithmetic, not a forecast.
3. Refresh market context. Read symbol, last/bid/ask, spread, displayed depth and UTC timestamps. Quotes change; do not expect the benchmark's prices. Stale/unavailable data must not be treated as liquidity.
4. Open Historical context and retrieve weekend history. Inspect the exact UTC window, sample size, exclusions and dated prices. If there are at least eight complete windows, compare the shock with observed starting-price-to-low declines and read the return percentiles. A short or unavailable sample is shown honestly. The separate Fed's March 15, 2020 Sunday statement supports off-hours information risk, not an rToken return or predicted outcome.
5. Ask: “What evidence would challenge a long position before the cash-market open?” Inspect Disclosure: asset, scenario, public question and weekend shock percentage are outgoing; privateNotes and positionNotional are absent. The server adds a case, fresh snapshot and independently retrieved weekend history. Hiding ticker disclosure omits the snapshot, token history and shock comparison from AI.
6. Request research. Check the counter-thesis, three evidence checks, invalidation conditions and attached sources. The AI snapshot may differ from a previous manual refresh: read its timestamp.
7. Form a research conclusion: “The chosen numerical stress is inside my budget, but issuer/redemption evidence, underlying reference context and repeated liquidity observations are still missing.” This is not a buy/sell signal.
8. Mark only checks actually reviewed. Export and inspect JSON: assumptions, result, selected source and optional snapshot are included; private notes and AI commentary are excluded.

## Actual run evidence
Task 1 in `evidence/research-benchmark.json` records the exact question/output and 12.469-second response. It raised potential reopening-price divergence and missing off-hours, depth and token-structure evidence. These are research hypotheses, not demonstrated market outcomes.

## Optional two-minute recording script
0:00–0:15: “This is FaradayDesk. Challenge a stock-token thesis without sending your full private notes to AI.” Show the inputs.

0:15–0:35: Set the sample assumptions. “425 USDT is transparent scenario math, not a prediction.”

0:35–0:55: Refresh Bitget context; point to symbol, timestamp and limited depth. “A venue snapshot is not guaranteed execution.”

0:55–1:15: Inspect Disclosure. “The public question is shared. Private fields stay local by default.”

1:15–1:45: Request research, then show the counter-thesis and primary sources. “Claude challenges assumptions; I verify evidence.”

1:45–2:00: Export. “A documented research decision. Humans remain in control.”

Use fictional notes in any recording. A script is not a completed video.

# FaradayDesk

Evidence before conviction. A human-led decision stress-testing workspace for Bitget stock-token spot positions, by Ileri Builds.

[Demo](https://faradaydesk.up.railway.app) · [Walkthrough](docs/WALKTHROUGH.md) · [Validation](docs/VALIDATION.md) · [Submission](docs/SUBMISSION.md)

## Working features
- Verified mappings: NVDA → RNVDAUSDT; TSLA → RTSLAUSDT; AAPL → RAAPLUSDT. Online SPOT stock-token metadata is checked on every fetch. Quote currency: USDT.
- Explicit public Bitget refresh: last/bid/ask, spread and 20-level displayed quote-depth with timestamps. Stale, missing or crossed data fails closed.
- Local long unleveraged stress calculation, chosen shock/costs, loss budget and worksheet export.
- Three curated primary-source historical lenses: Sunday Fed announcement, NVIDIA earnings and CPI. The weekend lens also retrieves observed token candle windows, with sample counts, return percentiles, dated prices and a shock comparison when enough complete windows exist. [Methodology](docs/WEEKEND-HISTORY.md). No event matching or predictive probabilities.
- Public natural-language question → Qwen 3.8 Max counter-thesis, evidence checks, missing evidence and invalidation conditions. The server attaches source links and verified weekend history when the ticker is disclosed.
- Faraday cage omits private notes and notional from outgoing requests by default. Ticker disclosure is independent. Inspect the fields before sending.
- Read-only WebMCP calculator. No account connection, order placement or autonomous execution.

## Complete a task
Choose NVDA and Weekend macro shock. Set 5,000 USDT, 8% adverse move, 0.5% assumed costs and 500 USDT budget. The local result is 425 USDT hypothetical loss and a calculated notional cap of 5,882.35 USDT. Refresh market context, inspect Disclosure, ask what would invalidate the thesis, verify sources, and export. Humans decide.

## Run locally
For the current Railway target: Node 24, `npm ci`, `npm run build:railway`, then `node --env-file=.env railway-dist/server/railway.js`. Configure server-only RESEARCH_API_URL, RESEARCH_MODEL, RESEARCH_API_KEY and RESEARCH_WIRE_API. The active provider is Bitget Qwen via the Responses API; see [Qwen setup](docs/QWEN.md). Never commit keys.

Legacy Sites target only: D1 stores one aggregate usage counter. Run `npm run build`, then apply the local migration:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_careful_skrulls.sql
```

Restart the development server after migration. On Windows ARM, use x64 Node for Cloudflare's local runtime. The author's ignored `.sites-runtime/node.exe` is not included in the repository.

## Privacy and limitations
Notes exist only in browser memory and disappear on refresh. Cage on excludes the entire field, not semantic anonymization. The public question is always shared: never put secrets in it. Cage off intentionally shares notes and notional with the server and provider. Hiding the ticker omits market context from AI; an independently requested refresh still sends the selected ticker to Bitget. Provider retention policies apply. Disclosure control is not a guarantee of anonymity.

AI demo allowance: 25 attempts per UTC day and 200 total, enforced atomically in persistent SQLite on Railway (D1 on legacy Sites). Failed provider attempts count. One visitor could consume the shared allowance; this is a cost ceiling, not per-user fairness. The counter stores no IPs, notes or questions. Local math, history retrieval and market refresh remain available when AI is exhausted.

Loss = notional × (adverse move + assumed costs) / 100. No probabilities, VaR, backtest, issuer/redemption verification, hedge validation or USDT peg guarantee. Displayed depth is not executable liquidity. Futures/liquidation need another model. Worksheet exports omit private notes and AI commentary.

## Verification
```sh
node --test tests/*.test.mjs
npx tsc --noEmit
npm run build:railway
```
Twenty-seven automated checks cover arithmetic, disclosure, market validation, report rendering, provider parsing, weekend calculations and usage caps. The earlier ten-task Claude benchmark completed in 9.543–12.469 seconds, median 11.291s; it is not a Qwen benchmark. Initial exact historical-URL compliance was 5/10; deterministic source attachment was added. Qwen subsequently completed a production smoke test in 11 seconds. These are engineering observations, not human adoption or trading results. See the validation report.

## Architecture
React 19, TypeScript, Vite, Node 24, persistent SQLite counter on Railway, public Bitget UTA v3 market/history APIs, server-side Qwen. The legacy Cloudflare target remains in the repository. Bitget tooling was used to discover and verify instruments during development. The deployed app calls public APIs directly; it does not host the MCP or Bitget Signal skills.

## Current hosting status
The demo is public on Railway at https://faradaydesk.up.railway.app. Qwen research and snapshots for all three instruments have passed production checks. Venue availability is not guaranteed; failures and recorded snapshots are explicitly labeled. The old Cloudflare HTTP 403 observation describes the legacy host, not a permanent restriction on Railway.

## Redesign and Railway target
The September 2026 redesign adds a responsive marketing/research split, a live local scenario preview, an orange hexagon field visual, a shield-style disclosure switch, research-flow navigation, outlined type and reduced-motion-aware animation. Existing inputs, arithmetic, source cases, request fields and exports are preserved.

For Railway, use `npm run build:railway` and follow [deployment instructions](docs/RAILWAY.md). The Node server shares the existing API handlers and uses a persistent SQLite volume for the usage counter.

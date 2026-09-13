# FaradayDesk

Evidence before conviction. A human-led decision stress-testing workspace for Bitget stock-token spot positions, by Ileri Builds.

[Demo](https://faradaydesk-ileri.zesty-lark-4600.chatgpt.site) · [Walkthrough](docs/WALKTHROUGH.md) · [Validation](docs/VALIDATION.md) · [Submission](docs/SUBMISSION.md)

## Working features
- Verified mappings: NVDA → RNVDAUSDT; TSLA → RTSLAUSDT; AAPL → RAAPLUSDT. Online SPOT stock-token metadata is checked on every fetch. Quote currency: USDT.
- Explicit public Bitget refresh: last/bid/ask, spread and 20-level displayed quote-depth with timestamps. Stale, missing or crossed data fails closed.
- Local long unleveraged stress calculation, chosen shock/costs, loss budget and worksheet export.
- Three curated primary-source historical lenses: Sunday Fed announcement, NVIDIA earnings and CPI. No historical-neighbor retrieval or return distribution is claimed.
- Public natural-language question → Claude Sonnet 4.6 counter-thesis, evidence checks and invalidation conditions. The server attaches source links.
- Faraday cage omits private notes and notional from outgoing requests by default. Ticker disclosure is independent. Inspect the fields before sending.
- Read-only WebMCP calculator. No account connection, order placement or autonomous execution.

## Complete a task
Choose NVDA and Weekend macro shock. Set 5,000 USDT, 8% adverse move, 0.5% assumed costs and 500 USDT budget. The local result is 425 USDT hypothetical loss and a calculated notional cap of 5,882.35 USDT. Refresh market context, inspect Disclosure, ask what would invalidate the thesis, verify sources, and export. Humans decide.

## Run locally
Node 22.13+, `npm ci`, `npm run dev`. Copy `.env.example` to `.env`; configure server-only RESEARCH_API_URL, RESEARCH_MODEL and RESEARCH_API_KEY. This deployment uses https://api.anthropic.com/v1/chat/completions and claude-sonnet-4-6. Never commit keys.

D1 stores one aggregate usage counter. Run `npm run build`, then apply the local migration:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_careful_skrulls.sql
```

Restart the development server after migration. On Windows ARM, use x64 Node for Cloudflare's local runtime. The author's ignored `.sites-runtime/node.exe` is not included in the repository.

## Privacy and limitations
Notes exist only in browser memory and disappear on refresh. Cage on excludes the entire field, not semantic anonymization. The public question is always shared: never put secrets in it. Cage off intentionally shares notes and notional with the server and provider. Hiding the ticker omits market context from AI; an independently requested refresh still sends the selected ticker to Bitget. Provider retention policies apply. Disclosure control is not a guarantee of anonymity.

AI demo allowance: 25 attempts per UTC day and 200 total, enforced atomically in D1. Failed provider attempts count. One visitor could consume the shared allowance; this is a cost ceiling, not per-user fairness. The counter stores no IPs, notes or questions. Local math and market refresh remain available when AI is exhausted.

Loss = notional × (adverse move + assumed costs) / 100. No probabilities, VaR, backtest, issuer/redemption verification, hedge validation or USDT peg guarantee. Displayed depth is not executable liquidity. Futures/liquidation need another model. Worksheet exports omit private notes and AI commentary.

## Verification
```sh
node --test tests/stress.test.mjs tests/market.test.mjs tests/budget.test.mjs
npx tsc --noEmit
npm run build
```
Eleven automated checks cover arithmetic, disclosure, market validation and usage caps. Ten synthetic Claude research tasks completed in 9.543–12.469 seconds, median 11.291s. Initial exact historical-URL compliance was 5/10; deterministic source attachment was added and checked separately. These are engineering observations, not human adoption or trading results. See the validation report.

## Architecture
React 19, TypeScript, vinext/Vite, Cloudflare Worker API routes, D1 counter, public Bitget UTA v3 market API, server-side Claude. Bitget Agent MCP was used to discover and verify instruments during development. The deployed app calls the public API directly; it does not host the MCP or Bitget Signal skills.

## Current hosting status
The demo is currently owner-private pending public-audience approval. Hosted Claude research works. Bitget returns HTTP 403 to the hosted server, although local market integration passes. The app reports the failure and optionally shows a dated NVDA validation snapshot, explicitly not live. AI omits unavailable market context. Do not submit the demo as publicly accessible until access is approved.

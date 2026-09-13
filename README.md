# FaradayDesk

A decision stress-testing workspace for hypothetical long tokenized-stock positions. Built for Bitget Base Camp S2, AI Trading Desk / Decision Stress Testing.

## Working features
- Editable ticker, local private notes and notional.
- Deterministic adverse-move and cost calculations with a user-defined loss budget.
- Three curated primary-source historical lenses, with explicit limits on comparability.
- Browser-local disclosure gate. With the cage on, the entire notes field and exact notional are absent from research requests. Public ticker sharing is independent.
- Review checklist, source links, and JSON worksheet export. Private notes and AI commentary are excluded from exports.
- Optional server-side research adapter. It is disabled until a provider URL, model and secret are configured. The interface does not simulate an AI response.
- Read-only WebMCP calculator where supported.

## Run
Node 22.13+; npm ci; npm run dev. Production: npm run build.
On this Windows ARM machine, the Cloudflare preview requires an x64 Node binary. A project-local ignored runtime is in `.sites-runtime/node.exe`. Prepend that directory to PATH and run the scripts with that binary. No global Node replacement is required.

## Optional AI setup
Configure RESEARCH_API_URL (complete HTTPS chat-completions endpoint), RESEARCH_MODEL, and RESEARCH_API_KEY as server-side secrets/settings. See `.env.example`. Never put a provider secret in browser code. A hosted Qwen provider has its own retention terms; open model availability is not a privacy guarantee.
The endpoint sends only approved request fields plus a fixed source-grounded system prompt and the selected public historical case. It does not connect to the user's Bitget trading account. No order placement is implemented.

## Calculation
Scenario loss = notional × (adverse move % + round-trip costs %) / 100.
Notional at budget = budget / combined loss rate. A zero combined rate yields no finite calculated cap.
These are illustrative user assumptions, not return forecasts, VaR, a stress probability, or a validated trading strategy. No current quotes, issuer-specific token data, order-book depth or estimated hedge effectiveness is provided. Long unleveraged spot only; leveraged futures and liquidation require a separate model.

## Privacy boundary
Notes exist only in React memory, with no persistence or analytics. The cage-on path excludes notes rather than claiming semantic anonymization. Only the research button sends a POST. Status checks contain no user input. The server attaches the displayed public historical case and a fixed system instruction. Provider processing and retention still apply. Turning the cage off intentionally includes the notes and notional. Disclosure cannot guarantee that remaining context is anonymous.

## Verification
`node --test tests/stress.test.mjs` checks arithmetic, zero boundaries, complete note exclusion, ticker disclosure and cage-off behavior. `npx tsc --noEmit` checks types. UI checks covered notional recalculation, disclosure toggling, scenario switching, source view, responsive layouts and WebMCP valid/invalid input.
Live provider quality is unmeasured until a provider is configured. No user preference, retention, trading performance or adoption metrics are claimed.

## Hackathon next steps
1. Configure and evaluate the chosen AI provider.
2. Expand the case library and test ten complete research tasks with documented rubrics.
3. Collect real tester feedback and label all metrics observed/targeted.
4. Record the walkthrough and prepare a compliant X post and submission description.
5. Make the demo accessible to judges and publish a public source repository with the owner's approval.


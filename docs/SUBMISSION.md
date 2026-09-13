# Hackathon submission draft

Official form verified 13 September 2026: https://docs.google.com/forms/d/e/1FAIpQLScojKm9H2xDNFL3ijcDcKxwG-_PvkmyimiAB-SEFOx_WsqGNA/viewform
Deadline: September 21, 2026, 23:59 UTC+8 = 16:59 Africa/Lagos. A valid project submission completes entry; there is no prior registration requirement.

## Form answers
Team: Ileri Builds (confirm solo/team details).
Track: AI Trading Desk.
Sub-theme: Decision Stress Testing.
Project: FaradayDesk.
One-line summary: A private-by-default research desk that challenges stock-token theses with Bitget snapshots, sourced context and local stress math.

Team lead UID, email, contact, member background, discovery channel and university (if applicable): owner must supply the correct details. Do not put UID or private contact details into the public repository. The current X post URL must be added after posting.

Preferences from the supplied thesis: S1 participation No; Demo Day Yes; Kimi K3 credits Yes; open to Playbook review Yes. Verify these when submitting.

## Project description — paste into the form itself

Part 1 · Thesis
FaradayDesk asks whether a trader can challenge an event-driven stock-token idea without routinely sending the complete private thesis or exact position size to a hosted model. Existing general-purpose chat workflows often blur private context, market facts and model interpretation. We separate a public question from private fields, make disclosure inspectable, and put transparent stress arithmetic beside source-grounded counter-thesis research. The hypothesis is that this improves research discipline and understanding of missing evidence. We have not yet demonstrated improved investment outcomes.

Part 2 · Target user and product value
The intended user is a crypto-native retail trader with roughly 2,000–25,000 USDT capital, moderate-to-high risk appetite, and several event/weekend stock-token decisions monthly. The initial market is Bitget stock-token spot, with RNVDAUSDT, RTSLAUSDT and RAAPLUSDT. The use case is a pre-position review while the underlying US stock market may be closed: inspect current venue conditions, apply a chosen adverse scenario, identify what could invalidate the thesis and keep a worksheet. The value is one inspectable workflow that separates local private inputs, public evidence and AI hypotheses. These are intended-user characteristics, not an observed customer base.

Part 3 · Validation data and key metrics
Observed: ten sequential synthetic research API tasks completed successfully on September 13, 2026, using Claude Sonnet 4.6. Response completion was 10/10; mean response time 11.243 seconds, median 11.291 seconds, range 9.543–12.469 seconds. Timings exclude human input, reading and source review. All outputs contained limitations and the cage-on sentinel was absent from outgoing requests. Initial exact historical-URL compliance was 5/10; we added deterministic source attachment, followed by two successful disclosed/hidden-ticker integration checks. Eleven engineering tests cover arithmetic, disclosure, market validation and atomic demo usage limits. These results do not establish human task success, adoption, investment quality or general hallucination resistance.
Targeted: five relevant testers complete two unaided tasks each, with at least 9/10 successful completions, median task time below 90 seconds and correct explanation of missing evidence/disclosure. Activation target is four of five first worksheets; retention target is three of five returning within seven days. No observed human users, AUM, trading volume, incremental fees, trading returns, Sharpe or risk reduction is claimed. We will record anonymous feedback and publish unsuccessful tasks alongside successful ones.

Part 4 · Progress
Built: a working research desk with three verified Bitget stock-token spot mappings, public UTA v3 instruments/tickers/orderbook endpoints, timestamped spread and limited depth, three curated historical source lenses, editable local stress assumptions, disclosure preview, Claude research, checklist and JSON export. Bitget Agent MCP market discovery was used to verify API support; the deployed app calls the public endpoints directly. Stack: React 19, TypeScript, vinext/Vite, Cloudflare Workers and a D1 aggregate usage counter. Claude Sonnet 4.6 supplies interpretation. Source links are attached outside the model because initial formatting was inconsistent. Market data rejects stale or invalid snapshots. Shared AI usage has daily and total caps. Not built: empirical historical-similarity retrieval, return distributions, portfolio modeling, issuer/redemption verification, execution or autonomous trading. Next: human feedback and a broader validated case library.

Part 5 · Take on AI Trading
The useful boundary is evidence and accountability. A model can challenge a thesis, but it should not turn incomplete venue data into certainty. Bitget's discoverable market tooling helped us verify the actual spot instruments instead of assuming the right product existed. Our product keeps trading decisions with humans and makes the private/public boundary inspectable. A curated case is context, not a validated predictive distribution.

## Submission Material Links — one per line
Demo: https://faradaydesk-ileri.zesty-lark-4600.chatgpt.site
Source and README: https://github.com/0xileri/FaradayDesk
Full research-task walkthrough: https://github.com/0xileri/FaradayDesk/blob/main/docs/WALKTHROUGH.md
Run records and validation: https://github.com/0xileri/FaradayDesk/blob/main/docs/VALIDATION.md
Exact synthetic run evidence: https://github.com/0xileri/FaradayDesk/blob/main/docs/evidence/research-benchmark.json

## LLM / AI role
Claude Sonnet 4.6 interprets the selected historical case and disclosed market context, challenges a public natural-language thesis, proposes evidence checks and identifies invalidation conditions. It has no trading tools. Arithmetic, disclosure omission, instrument validation, source attachment and usage limits are deterministic application code. Codex assisted implementation and testing. The model does not retrieve an empirical return distribution, validate issuer reserves or make autonomous trading decisions.

## Remaining owner actions
- Confirm team/contact/background/university details in the form.
- Collect real tester feedback using FEEDBACK.md; update observed metrics only after actual tests.
- Post the approved X draft, then add its real URL. No post has been sent by the agent.
- Optionally record the two-minute walkthrough; a written full research task is prepared. Do not claim a video exists until it does.
- Review the completed form and submit before the deadline. The form has not been submitted.

## Current blockers — update before submission
The repository is public. The demo remains owner-private pending explicit public-audience approval. The deployed Bitget feed returns HTTP 403; local data integration works, and the UI offers an optional dated validation snapshot rather than claiming live quotes. Hosted Claude research works without unavailable market context. Include this limitation in Part 4 unless it has been resolved; the materials are not yet a valid complete entry because public demo access and the X post remain outstanding.

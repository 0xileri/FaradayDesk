# Railway deployment

Live deployment: https://faradaydesk.up.railway.app

Verified 12 October 2026: production health check, live snapshots for all three instruments, weekend history retrieval and a Qwen research request passed, alongside 28 request-level checks covering error, size, origin and path handling. Venue availability still depends on Bitget. Service `faradaydesk` uses a persistent `/data` volume and `PORT=3000`, matching the public domain target port. Credentials are runtime environment variables and are never committed.

This target reuses the same React page and research/market handlers. It serves the Vite-built frontend and `/api/research`, `/api/market`, `/api/history` on Node 24. `/healthz` is Railway's health check and is never rate limited. No Cloudflare runtime is required on Railway.

Static files in `public/` are served from the build: `robots.txt`, `sitemap.xml`, `llms.txt` (an agent-readable description of the endpoints and how to read the figures) and `og-image.png` (the link preview card, regenerated with `node scripts/make-og-image.mjs`).

## Deploy
1. Sign in at https://railway.com and create a project from `0xileri/FaradayDesk` on GitHub.
2. Railway detects the root Dockerfile. Keep one replica.
3. Attach a persistent volume at `/data` before deploying. Railway supplies `RAILWAY_VOLUME_MOUNT_PATH`. Production deliberately refuses to start without the volume so the AI cap cannot reset on every redeploy.
4. Add runtime variables (not build arguments): `RESEARCH_API_URL`, `RESEARCH_MODEL`, `RESEARCH_API_KEY` and `RESEARCH_WIRE_API`. Production currently uses the Bitget Qwen gateway with `RESEARCH_WIRE_API=responses`; Claude and other OpenAI-compatible endpoints work with the default `chat`. See [Qwen setup](QWEN.md). Never commit a secret. Set `PUBLIC_ORIGIN` to the generated HTTPS app URL if Railway does not supply `RAILWAY_PUBLIC_DOMAIN`.
   Optional ceilings per client address, counted hourly: `RESEARCH_IP_HOURLY_LIMIT` (default 10 research requests) and `DATA_IP_HOURLY_LIMIT` (default 120 market/history requests). They protect the shared AI allowance and Bitget's rate limits from a single caller; set either to 0 to disable.
5. Set `PORT=3000` and generate a public Railway domain targeting port 3000, deploy, and verify `/healthz`, the research configuration, a synthetic research request and worksheet export.

The Docker runtime contains only the compiled app. `.env`, `.git`, local databases and runtime state are excluded from its build context. Keys are read only by server code at runtime. SQLite stores the same aggregate 25/day, 200-total quota with atomic SQL. A new Railway service has its own counter; this does not combine usage with the old Sites deployment. Keep a single replica with one persistent volume.

## Local verification
```sh
npm run build:railway
node --env-file=.env railway-dist/server/railway.js
node --test tests/stress.test.mjs tests/market.test.mjs tests/budget.test.mjs tests/railway.test.mjs
```
Local default URL: http://localhost:3000. Local state is ignored in `.railway-data/`. `PORT` is honored; the server binds to `0.0.0.0`.

The original Sites build remains available through its existing scripts; `build:railway` is a separate target. The market-feed behavior was not changed during the redesign. Bitget availability on Railway must be verified after actual deployment; moving hosts is not a promise to fix the previous HTTP 403.

Official references: https://docs.railway.com/builds/dockerfiles · https://docs.railway.com/volumes · https://docs.railway.com/networking/public-networking

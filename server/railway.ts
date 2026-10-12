import { createServer, type IncomingMessage } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { mkdirSync } from "node:fs";
import { resolve, dirname, extname, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { createResearchHandlers } from "../lib/research-handler";
import { reserveSQL } from "../lib/research-budget";
import { GET as market } from "../app/api/market/route";
import { GET as history } from "../app/api/history/route";

if (
  process.env.NODE_ENV === "production" &&
  !process.env.RAILWAY_VOLUME_MOUNT_PATH
)
  throw Error(
    "Attach a persistent Railway volume at /data before starting production.",
  );
const dbPath = resolve(
  process.env.RAILWAY_VOLUME_MOUNT_PATH || ".railway-data",
  "demo.sqlite",
);
mkdirSync(dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);
db.exec(
  "PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS demo_budget(id INTEGER PRIMARY KEY,day TEXT NOT NULL,daily INTEGER NOT NULL,total INTEGER NOT NULL)",
);
const reserve = async () =>
  !!db.prepare(reserveSQL).get(new Date().toISOString().slice(0, 10));
const research = createResearchHandlers(() => process.env, reserve);
// Per-address ceiling. The AI allowance and Bitget's rate limits are shared by
// every visitor, so one caller must not be able to drain them for the rest.
const limits = {
  research: Number(process.env.RESEARCH_IP_HOURLY_LIMIT ?? 10),
  data: Number(process.env.DATA_IP_HOURLY_LIMIT ?? 120),
};
const WINDOW_MS = 3600000;
const seen = new Map<string, number[]>();
const addressOf = (req: IncomingMessage) =>
  String(req.headers["x-forwarded-for"] ?? "")
    .split(",")[0]
    .trim() ||
  req.socket.remoteAddress ||
  "unknown";
function overLimit(bucket: keyof typeof limits, req: IncomingMessage) {
  const limit = limits[bucket];
  if (!Number.isFinite(limit) || limit <= 0) return false;
  const now = Date.now();
  if (seen.size > 5000)
    for (const [key, times] of seen)
      if (!times.some((t) => t > now - WINDOW_MS)) seen.delete(key);
  const key = bucket + " " + addressOf(req);
  const recent = (seen.get(key) ?? []).filter((t) => t > now - WINDOW_MS);
  seen.set(key, recent);
  if (recent.length >= limit) return true;
  recent.push(now);
  return false;
}
const publicRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../client",
);
const mime: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
};
const server = createServer(async (req, res) => {
  try {
    const origin =
      process.env.PUBLIC_ORIGIN ||
      (process.env.RAILWAY_PUBLIC_DOMAIN
        ? "https://" + process.env.RAILWAY_PUBLIC_DOMAIN
        : "http://" + (req.headers.host || "localhost"));
    const url = new URL(req.url || "/", origin);
    const headers = new Headers();
    for (const [k, v] of Object.entries(req.headers))
      if (v !== undefined) headers.set(k, Array.isArray(v) ? v.join(",") : v);
    if (url.pathname === "/healthz") {
      res.writeHead(200, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      });
      res.end('{"ok":true}');
      return;
    }
    if (url.pathname.startsWith("/api/")) {
      const bucket =
        req.method === "POST" && url.pathname === "/api/research"
          ? "research"
          : "data";
      if (overLimit(bucket, req)) {
        res.writeHead(429, {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
          "Retry-After": "600",
        });
        res.end(
          '{"error":"Too many requests from this address. The shared demo allowance is limited; please try again later."}',
        );
        return;
      }
      let response: Response;
      if (req.method === "GET" && url.pathname === "/api/research")
        response = await research.GET();
      else if (req.method === "GET" && url.pathname === "/api/market")
        response = await market(new Request(url, { headers }));
      else if (req.method === "GET" && url.pathname === "/api/history")
        response = await history(new Request(url, { headers }));
      else if (req.method === "POST" && url.pathname === "/api/research") {
        const chunks: Buffer[] = [];
        let bytes = 0;
        for await (const chunk of req) {
          bytes += chunk.length;
          if (bytes > 48000) {
            res.writeHead(413, { "Content-Type": "application/json" });
            res.end('{"error":"Research request is too large."}');
            return;
          }
          chunks.push(Buffer.from(chunk));
        }
        response = await research.POST(
          new Request(url, {
            method: "POST",
            headers,
            body: Buffer.concat(chunks).toString("utf8"),
          }),
        );
      } else
        response = Response.json(
          { error: "Route or method not supported." },
          { status: 404 },
        );
      const { "cache-control": cacheControl, ...headersOut } =
        Object.fromEntries(response.headers);
      res.writeHead(response.status, {
        ...headersOut,
        "Cache-Control": cacheControl ?? "no-store",
      });
      res.end(Buffer.from(await response.arrayBuffer()));
      return;
    }
    if (req.method !== "GET" && req.method !== "HEAD") {
      res.writeHead(405);
      res.end();
      return;
    }
    const pathname = decodeURIComponent(url.pathname);
    const file = resolve(
      publicRoot,
      "." + (pathname === "/" ? "/index.html" : pathname),
    );
    if (!file.startsWith(publicRoot + sep)) {
      res.writeHead(404);
      res.end();
      return;
    }
    try {
      if (!(await stat(file)).isFile()) throw Error("not file");
    } catch {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": mime[extname(file)] || "application/octet-stream",
      "Cache-Control": pathname.startsWith("/assets/")
        ? "public, max-age=31536000, immutable"
        : "no-cache",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    });
    res.end(req.method === "HEAD" ? undefined : await readFile(file));
  } catch {
    if (!res.headersSent)
      res.writeHead(500, { "Content-Type": "application/json" });
    res.end('{"error":"Request unavailable. Please retry."}');
  }
});
server.requestTimeout = 70000;
server.headersTimeout = 15000;
server.listen(Number(process.env.PORT || 3000), "0.0.0.0", () =>
  console.log("FaradayDesk ready"),
);
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.on(signal, () =>
    server.close(() => {
      db.close();
      process.exit(0);
    }),
  );

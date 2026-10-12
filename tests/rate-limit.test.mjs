import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, basename, sep } from "node:path";
import { once } from "node:events";

test("per-address limits protect the shared AI allowance and venue data", async () => {
  const dir = await mkdtemp(join(tmpdir(), "faraday-rate-"));
  let child;
  const provider = createServer((req, res) => {
    req.resume();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        choices: [
          {
            message: { content: "Thesis challenge. Limitations apply." },
            finish_reason: "stop",
          },
        ],
      }),
    );
  });
  provider.listen(0, "127.0.0.1");
  await once(provider, "listening");
  const providerPort = provider.address().port;
  const portProbe = createServer();
  portProbe.listen(0, "127.0.0.1");
  await once(portProbe, "listening");
  const port = portProbe.address().port;
  await new Promise((r) => portProbe.close(r));
  const base = "http://127.0.0.1:" + port;
  const post = () =>
    fetch(base + "/api/research", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: base },
      body: JSON.stringify({
        asset: "UNDISCLOSED",
        scenario: "weekend",
        question: "Challenge a hypothetical thesis.",
      }),
    });
  try {
    child = spawn(process.execPath, ["railway-dist/server/railway.js"], {
      env: {
        ...process.env,
        NODE_ENV: "production",
        RAILWAY_VOLUME_MOUNT_PATH: dir,
        PORT: String(port),
        PUBLIC_ORIGIN: base,
        RESEARCH_API_URL: "http://127.0.0.1:" + providerPort,
        RESEARCH_API_KEY: "synthetic-test-key",
        RESEARCH_MODEL: "test",
        RESEARCH_IP_HOURLY_LIMIT: "2",
        DATA_IP_HOURLY_LIMIT: "1",
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    await new Promise((ready, reject) => {
      let out = "";
      child.stdout.on("data", (c) => {
        out += c;
        if (out.includes("FaradayDesk ready")) ready();
      });
      child.once("exit", (code) => reject(Error("Server exited " + code)));
      setTimeout(() => reject(Error("Server startup timeout")), 10000).unref();
    });
    assert.equal((await post()).status, 200);
    assert.equal((await post()).status, 200);
    const limited = await post();
    assert.equal(limited.status, 429);
    assert.equal(limited.headers.get("retry-after"), "600");
    assert.match((await limited.json()).error, /Too many requests/);
    // Venue data is counted in its own bucket, and a rejected request still
    // counts: validation happens after the address ceiling.
    assert.equal((await fetch(base + "/api/market?asset=INVALID")).status, 400);
    assert.equal((await fetch(base + "/api/market?asset=NVDA")).status, 429);
    assert.equal(
      (await fetch(base + "/healthz")).status,
      200,
      "health checks are never rate limited",
    );
  } finally {
    if (child && child.exitCode === null) {
      child.kill();
      await once(child, "exit");
    }
    await new Promise((r) => provider.close(r));
    assert.ok(
      resolve(dir).startsWith(resolve(tmpdir()) + sep) &&
        basename(dir).startsWith("faraday-rate-"),
    );
    await rm(dir, { recursive: true, force: true });
  }
});

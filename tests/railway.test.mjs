import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve, basename, sep } from "node:path";
import { once } from "node:events";

test("Railway routes preserve privacy, origin checks and persistent quota across restart", async () => {
  const dir = await mkdtemp(join(tmpdir(), "faraday-test-"));
  let child;
  const captured = [];
  const provider = createServer(async (req, res) => {
    let raw = "";
    for await (const c of req) raw += c;
    captured.push(JSON.parse(raw));
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        choices: [
          {
            message: {
              content:
                "Thesis challenge. Verify evidence and limitations. No guaranteed result.",
            },
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
  const launch = async () => {
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
      },
      stdio: ["ignore", "pipe", "pipe"],
    });
    await new Promise((resolve, reject) => {
      let out = "";
      child.stdout.on("data", (c) => {
        out += c;
        if (out.includes("FaradayDesk ready")) resolve();
      });
      child.once("exit", (code) => reject(Error("Server exited " + code)));
      setTimeout(() => reject(Error("Server startup timeout")), 10000).unref();
    });
  };
  const post = (payload, origin = base) =>
    fetch(base + "/api/research", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: origin },
      body: JSON.stringify(payload),
    });
  try {
    await launch();
    assert.equal((await fetch(base + "/healthz")).status, 200);
    assert.ok((await (await fetch(base)).text()).includes("FaradayDesk"));
    const payload = {
      asset: "UNDISCLOSED",
      scenario: "weekend",
      question: "Challenge a hypothetical thesis.",
    };
    assert.equal(
      (await post(payload, "https://unrelated.example")).status,
      403,
    );
    assert.equal((await post({ ...payload, asset: "INVALID" })).status, 400);
    for (let i = 0; i < 25; i++) {
      const r = await post(payload);
      assert.equal(r.status, 200);
      const d = await r.json();
      assert.ok(d.text.includes("https://www.federalreserve.gov/"));
      assert.equal(
        d.marketContext.status,
        "Omitted because ticker disclosure is disabled.",
      );
    }
    assert.equal(captured.length, 25);
    for (const c of captured) {
      const data = JSON.parse(c.messages[1].content);
      assert.ok(!("privateNotes" in data.research));
      assert.ok(!("positionNotional" in data.research));
    }
    assert.equal((await post(payload)).status, 429);
    child.kill();
    await once(child, "exit");
    await launch();
    assert.equal((await post(payload)).status, 429);
    assert.equal((await fetch(base + "/api/market?asset=INVALID")).status, 400);
    assert.equal((await fetch(base + "/.env")).status, 404);
  } finally {
    if (child && child.exitCode === null) {
      child.kill();
      await once(child, "exit");
    }
    await new Promise((r) => provider.close(r));
    assert.ok(resolve(dir).startsWith(resolve(tmpdir()) + sep) && basename(dir).startsWith("faraday-test-"));
    await rm(dir, { recursive: true, force: true });
  }
});

import { useState } from "react";
import type { WeekendHistory as History } from "@/lib/bitget-history";
import { compareShock } from "@/lib/weekend-history";
export function WeekendHistory({
  asset,
  lens,
  shock,
}: {
  asset: string;
  lens: string;
  shock: number;
}) {
  const [data, setData] = useState<History | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  // A keyed parent discards results belonging to a previous instrument/lens.
  async function load() {
    setBusy(true);
    setError("");
    setData(null);
    try {
      const r = await fetch(
        "/api/history?lens=weekend&asset=" + encodeURIComponent(asset),
        { signal: AbortSignal.timeout(25000), cache: "no-store" },
      );
      const d = (await r.json()) as History & { error?: string };
      if (!r.ok) throw Error(d.error || "History unavailable.");
      setData(d);
    } catch {
      setError("Verified weekend history is unavailable. Try again later.");
    } finally {
      setBusy(false);
    }
  }
  const comparison = data?.sufficient
    ? compareShock(data.windows, shock)
    : null;
  const pct = (n: number) => (n > 0 ? "+" : "") + n.toFixed(2) + "%";
  return (
    <section className="weekend-history">
      <span className="eyebrow orange">OBSERVED HISTORY / NOT PROBABILITY</span>
      <h3>Put the shock in context.</h3>
      {lens !== "weekend" ? (
        <p>
          Quantitative comparisons are available for the weekend lens. Earnings
          and CPI event-matched samples are not implemented.
        </p>
      ) : (
        <>
          <p>
            Compare {asset} stock-token trading across complete Saturday–Sunday
            UTC windows from the preceding 84 days.
          </p>
          <button className="secondary" onClick={load} disabled={busy}>
            {busy ? "Checking historical candles…" : "Retrieve weekend history"}
          </button>
          <p className="fieldnote">
            Sends only the ticker and weekend lens. No private notes or position
            size. History may be cached for up to one hour.
          </p>
          {error && (
            <p role="status" className="orange">
              {error}
            </p>
          )}
          {data && (
            <>
              <p role="status">
                <strong>{data.sampleSize} complete weekends</strong> ·{" "}
                {data.excluded} excluded for missing or inactive candles · Small
                sample
              </p>
              <p className="fieldnote">
                {data.symbol} · {data.from.slice(0, 10)} to{" "}
                {data.to.slice(0, 10)} · Retrieved {data.retrievedAt}
              </p>
              <p>{data.windowDefinition}</p>
              {!data.sufficient && (
                <p className="orange">
                  Fewer than 8 complete weekends. Percentiles and shock ranking
                  are withheld.
                </p>
              )}
              {data.stats && (
                <>
                  <div className="history-metrics">
                    {[
                      ["10th percentile", pct(data.stats.p10)],
                      ["Median return", pct(data.stats.median)],
                      ["90th percentile", pct(data.stats.p90)],
                      ["Worst end return", pct(data.stats.worstReturn)],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <span>{label}</span>
                        <strong>{value}</strong>
                      </div>
                    ))}
                  </div>
                  <p className="fieldnote">
                    Returns compare Saturday opening price with the last Sunday
                    candle close. Gains and losses are both included.
                  </p>
                  <p>
                    <strong>
                      Largest observed decline from the starting price within a
                      weekend: {data.stats.worstAdverse.toFixed(2)}%.
                    </strong>{" "}
                    This uses candle lows, not just the ending return.
                  </p>
                  <p className="history-comparison">
                    Your {shock.toFixed(1)}% shock exceeds the
                    starting-price-to-low decline in{" "}
                    {comparison?.strictlySmaller} of these{" "}
                    {comparison?.sampleSize} windows. This is a sample count,
                    not a forecast.
                  </p>
                </>
              )}
              <details>
                <summary>Inspect all dated windows and prices</summary>
                <div className="history-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Weekend starts (UTC)</th>
                        <th>Open → close (USDT)</th>
                        <th>End return</th>
                        <th>Decline to low</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.windows.map((w) => (
                        <tr key={w.start}>
                          <td>{w.start.slice(0, 10)}</td>
                          <td>
                            {w.open} → {w.close}
                          </td>
                          <td>{pct(w.returnPercent)}</td>
                          <td>{w.adversePercent.toFixed(2)}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </details>
              <p className="fieldnote">{data.limitations}</p>
              <a href={data.source} target="_blank" rel="noreferrer">
                Bitget historical candle source ↗
              </a>
            </>
          )}
        </>
      )}
    </section>
  );
}

import { ArrowDown, ArrowUpRight, Hexagon, Shield } from "lucide-react";

export function DeskHero({
  loss,
  shock,
  cost,
  cage,
  onDisclosure,
}: {
  loss: number;
  shock: number;
  cost: number;
  cage: boolean;
  onDisclosure: () => void;
}) {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <div className="eyebrow">
          <span className="signal-dot" /> INDEPENDENT THINKING. STRUCTURED RESEARCH.
        </div>
        <h1 id="hero-title">
          Before
          <br />
          the <span>open.</span>
        </h1>
        <p className="hero-description">
          Put your trade thesis under pressure.
          <br />
          Before you put capital behind it.
        </p>
        <p
          className="wordline"
          aria-label="Stress-test before you size, hedge, or commit."
        >
          Stress-test before you{" "}
          <span className="word-window" aria-hidden="true">
            <span>size.</span>
            <span>hedge.</span>
            <span>commit.</span>
          </span>
        </p>
        <div className="hero-actions">
          <a className="primary" href="#workspace">
            Enter the research desk <ArrowUpRight size={18} />
          </a>
          <a href="#method" className="plain-link">
            Explore the method <ArrowDown size={15} />
          </a>
        </div>
        <div className="hero-bottom">
          <span>BITGET STOCK-TOKEN SPOT</span>
          <span>HUMAN-LED. ALWAYS.</span>
        </div>
      </div>
      <div className="hero-system">
        <div className="hero-art-caption" aria-hidden="true"><span>FD—01</span><span>THE CONVICTION STUDY</span></div>
        <div className="field-sculpture" aria-hidden="true">
          <svg viewBox="0 0 600 420">
            <g fill="none" stroke="#171916">
              <path d="M55 210H545M300 18V400" opacity=".18" strokeDasharray="3 6" />
              <ellipse cx="300" cy="365" rx="140" ry="16" fill="#171916" opacity=".06" stroke="none" />
              {Array.from({ length: 15 }, (_, i) => (
                <polygon key={i} points="0,-139 121,-70 121,70 0,139 -121,70 -121,-70"
                  transform={`translate(${255 + i * 6.5} ${175 + i * 3}) scale(.95 1)`}
                  strokeWidth={i === 0 || i === 14 ? 2.6 : 1.1} opacity={i === 0 || i === 14 ? 1 : .65} />
              ))}
              <path d="M255 36L346 78M140 108L231 150M140 242L231 284M255 314L346 356M370 242L461 284M370 108L461 150" strokeWidth="2" />
            </g>
            <path d="M283 158H330V168H296V187H323V197H296V227H283Z" fill="#171916" />
            <g fill="#171916" fontFamily="monospace" fontSize="9"><text x="45" y="205">01</text><text x="530" y="205">02</text><text x="310" y="30">FIELD / F</text></g>
          </svg>
          <span className="sculpture-label">
            FIELD / {cage ? "ENGAGED" : "STANDBY"}
          </span>
        </div>
        <article className="hero-terminal">
          <div className="terminal-title">
            <span>
              <Hexagon size={14} /> SCENARIO / ACTIVE
            </span>
            <span className="honesty-label">ILLUSTRATIVE — NOT LIVE</span>
          </div>
          <div className="terminal-body">
            <div>
              <span className="eyebrow">HYPOTHETICAL LOSS</span>
              <strong>
                −{loss.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                <small>USDT</small>
              </strong>
            </div>
            <svg
              viewBox="0 0 280 90"
              role="img"
              aria-label="Illustrative loss rises with the chosen adverse move"
            >
              <path
                d="M0 80H280M0 40H280"
                stroke="#303338"
                strokeDasharray="2 5"
              />
              <path
                className="preview-curve"
                d="M4 80L276 9"
                fill="none"
                stroke="#ff7f00"
                strokeWidth="2"
              />
              <circle
                cx={4 + (shock / 30) * 272}
                cy={80 - (shock / 30) * 71}
                r="4"
                fill="#ff7f00"
              />
            </svg>
          </div>
          <div className="terminal-meta">
            <span>
              SHOCK <b>{shock.toFixed(1)}%</b>
            </span>
            <span>
              ASSUMED COST <b>{cost.toFixed(1)}%</b>
            </span>
            <span>LONG / SPOT</span>
          </div>
        </article>
        <button className="hero-disclosure" onClick={onDisclosure}>
          <Shield size={25} />
          <span>
            <strong>Your thesis. Your boundary.</strong>
            <small>
              {cage
                ? "Notes + position size excluded by default."
                : "Cage off. Inspect what you disclose."}
            </small>
          </span>
          <ArrowUpRight size={20} />
        </button>
        <div className="system-caption">
          <span>01 / INSPECT THE ASSUMPTION</span>
          <span>SCROLL TO RESEARCH ↓</span>
        </div>
      </div>
    </section>
  );
}

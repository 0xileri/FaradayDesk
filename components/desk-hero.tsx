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
          <span className="signal-dot" /> ILERI BUILDS / RESEARCH SYSTEM 01
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
        <div className="hero-watermark" aria-hidden="true">
          FARADAY
        </div>
        <div className="field-sculpture" aria-hidden="true">
          <svg viewBox="0 0 600 420">
            <defs>
              <radialGradient id="cage-glow">
                <stop stopColor="#ff7f00" stopOpacity=".2" />
                <stop offset="1" stopColor="#ff7f00" stopOpacity="0" />
              </radialGradient>
            </defs>
            <ellipse
              cx="300"
              cy="235"
              rx="275"
              ry="185"
              fill="url(#cage-glow)"
            />
            <g className="field-lines" fill="none" stroke="#ff7f00">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <polygon
                  key={i}
                  points="300,42 449,128 449,300 300,386 151,300 151,128"
                  transform={`translate(300 214) scale(${1 - i * 0.095}) translate(-300 -214)`}
                  opacity={0.14 + i * 0.09}
                />
              ))}
              <path
                d="M300 42V386M151 128L449 300M449 128L151 300"
                opacity=".35"
              />
            </g>
            <g fill="#ff7f00">
              {[
                [300, 42],
                [449, 128],
                [449, 300],
                [300, 386],
                [151, 300],
                [151, 128],
              ].map(([x, y]) => (
                <circle key={`${x}-${y}`} cx={x} cy={y} r="3" />
              ))}
            </g>
            <path
              d="M283 188H320V197H293V210H315V220H293V246H283Z"
              fill="#ff7f00"
            />
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

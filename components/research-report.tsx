import { splitResearchReport } from "@/lib/research-report";

export function ResearchReport({ text }: { text: string }) {
  const sections = splitResearchReport(text);
  return (
    <article
      className="aireport research-report"
      aria-label="AI research report"
    >
      <header className="report-heading">
        <div>
          <span className="report-eyebrow">
            RESEARCH MEMO / AI INTERPRETATION
          </span>
          <h3>Challenge the conviction.</h3>
        </div>
        <span className="report-badge">VERIFY AGAINST SOURCES</span>
      </header>
      <p className="report-intro">
        AI interpretation needs your review. Check the evidence and limitations
        before deciding.
      </p>
      <div className="report-sections">
        {sections.map((section, index) => (
          <section
            className="report-section"
            data-kind={section.title}
            key={index}
          >
            <div className="report-section-heading">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h4>{section.title}</h4>
            </div>
            <div className="report-body">
              {section.body.split(/\n\s*\n/).map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>
      <details className="report-original">
        <summary>Inspect original report text</summary>
        <pre>{text}</pre>
      </details>
    </article>
  );
}

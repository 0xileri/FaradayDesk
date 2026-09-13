export type ReportSection = { title: string; body: string };
const headings: Record<string, string> = {
  "THESIS CHALLENGE": "Thesis challenge",
  "EVIDENCE CHECKS": "Evidence checks",
  "THREE EVIDENCE CHECKS": "Evidence checks",
  "MISSING EVIDENCE": "Missing evidence",
  "INVALIDATION CONDITIONS": "Invalidation conditions",
  LIMITATIONS: "Limitations",
  "MARKET SNAPSHOT NOTE": "Market snapshot note",
  "SOURCE RECORD (ATTACHED BY FARADAYDESK)": "Source record",
};

// Only standalone known headings become sections. Unrecognized content is kept.
export function splitResearchReport(text: string): ReportSection[] {
  const sections: ReportSection[] = [];
  let title = "Research context";
  let lines: string[] = [];
  const flush = () => {
    const body = lines.join("\n").trim();
    if (body) sections.push({ title, body });
    lines = [];
  };
  for (const line of text.split(/\r?\n/)) {
    const key = line
      .trim()
      .replace(/^#{1,6}\s+/, "")
      .replace(/^\*\*|\*\*$/g, "")
      .replace(/:$/, "")
      .toUpperCase();
    const heading = Object.hasOwn(headings, key) ? headings[key] : undefined;
    if (heading) {
      flush();
      title = heading;
    } else lines.push(line);
  }
  flush();
  return sections;
}

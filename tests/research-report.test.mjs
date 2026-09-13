import { test } from "node:test";
import assert from "node:assert/strict";
import { splitResearchReport } from "../lib/research-report.ts";
test("report groups headings without dropping unknown text or source records", () => {
  const result = splitResearchReport(
    "Research context: NVDA\n\nTHESIS CHALLENGE\nA hypothesis.\n\nMISSING EVIDENCE:\nNo verified guidance.\n\nSource record (attached by FaradayDesk)\nHistorical case: https://example.com",
  );
  assert.deepEqual(
    result.map((s) => s.title),
    [
      "Research context",
      "Thesis challenge",
      "Missing evidence",
      "Source record",
    ],
  );
  assert.equal(result[3].body, "Historical case: https://example.com");
});
test("unexpected prose, markup and object property names remain text", () => {
  const input =
    "Unstructured response\nTHESIS CHALLENGE: inline text\n<script>alert(1)</script>\n__proto__\nconstructor";
  assert.deepEqual(splitResearchReport(input), [
    { title: "Research context", body: input },
  ]);
});
test("recognizes heading variants and keeps repeated section contents", () => {
  const result = splitResearchReport(
    "## Evidence checks\r\n1. Verify.\r\n\r\n**LIMITATIONS**\r\nUnknown.\r\nLIMITATIONS\r\nStill unknown.",
  );
  assert.deepEqual(
    result.map((s) => s.body),
    ["1. Verify.", "Unknown.", "Still unknown."],
  );
});

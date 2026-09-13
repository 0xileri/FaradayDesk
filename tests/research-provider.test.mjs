import { test } from "node:test";
import assert from "node:assert/strict";
import { providerPayload, providerText } from "../lib/research-provider.ts";
test("Responses adapter preserves messages, bounds output and disables storage", () => {
  const messages = [
    { role: "system", content: "Rules" },
    { role: "user", content: "Disclosed input" },
  ];
  assert.deepEqual(providerPayload("qwen3.8-max", messages, "responses"), {
    model: "qwen3.8-max",
    input: messages,
    max_output_tokens: 1200,
    store: false,
    reasoning: { effort: 'none' },
  });
  assert.equal(providerPayload("claude", messages, "chat").messages, messages);
});
test("Responses extraction uses assistant output text and excludes reasoning", () => {
  assert.equal(
    providerText(
      {
        status: "completed",
        output: [
          {
            type: "reasoning",
            content: [{ type: "output_text", text: "Hidden" }],
          },
          {
            type: "message",
            role: "assistant",
            content: [{ type: "output_text", text: "Report" }],
          },
        ],
      },
      "responses",
    ),
    "Report",
  );
  for (const data of [
    { status: "incomplete", output: [] },
    { status: "failed" },
    { status: "completed", output: [] },
  ])
    assert.throws(() => providerText(data, "responses"));
});
test("chat compatibility and incomplete output handling remain intact", () => {
  assert.equal(
    providerText(
      { choices: [{ message: { content: "Report" }, finish_reason: "stop" }] },
      "chat",
    ),
    "Report",
  );
  assert.throws(() =>
    providerText(
      {
        choices: [{ message: { content: "Partial" }, finish_reason: "length" }],
      },
      "chat",
    ),
  );
});

type Message = { role: string; content: string };
export function providerPayload(
  model: string,
  messages: Message[],
  wire: string,
) {
  if (wire === "responses")
    return { model, input: messages, max_output_tokens: 1200, store: false };
  if (wire !== "chat") throw Error("Unsupported research API protocol.");
  return { model, messages, max_tokens: 1200 };
}
export function providerText(data: unknown, wire: string): string {
  if (!data || typeof data !== "object")
    throw Error("Invalid provider response.");
  const d = data as {
    status?: string;
    output?: {
      type?: string;
      role?: string;
      content?: { type?: string; text?: string }[];
    }[];
    choices?: { finish_reason?: string; message?: { content?: string } }[];
  };
  if (wire === "responses") {
    if (d.status !== "completed" || !Array.isArray(d.output))
      throw Error("Incomplete provider response.");
    const text = d.output
      .filter((item) => item.type === "message" && item.role === "assistant")
      .flatMap((item) => (Array.isArray(item.content) ? item.content : []))
      .filter(
        (part) => part.type === "output_text" && typeof part.text === "string",
      )
      .map((part) => part.text)
      .join("\n");
    if (!text.trim()) throw Error("Empty provider response.");
    return text;
  }
  if (d.choices?.[0]?.finish_reason === "length")
    throw Error("Incomplete provider response.");
  const text = d.choices?.[0]?.message?.content;
  if (typeof text !== "string" || !text.trim())
    throw Error("Empty provider response.");
  return text;
}

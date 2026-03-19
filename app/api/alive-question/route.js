import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

export async function POST(req) {
  try {
    const { keywords } = await req.json();

    if (!keywords?.trim()) {
      return Response.json({ error: "No keywords provided" }, { status: 400 });
    }

    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 120,
      messages: [
        {
          role: "user",
          content: `A dinner host wants to ask their guest a single question before they meet. The host described the vibe of their dinner with these words: "${keywords}"

Write exactly one question the host could ask. Requirements:
- It should feel like something a thoughtful, curious person would ask — not a survey
- Warm, a little specific, conversational
- Under 20 words
- No quotation marks, no preamble, no explanation — just the question itself

The question:`,
        },
      ],
    });

    const raw = message.content[0]?.text?.trim() ?? "";

    // Strip any accidental quotes or trailing punctuation oddities
    const question = raw.replace(/^["']|["']$/g, "").trim();

    return Response.json({ question });
  } catch (err) {
    console.error("alive-question error:", err);
    return Response.json({ error: "Failed to generate question" }, { status: 500 });
  }
}
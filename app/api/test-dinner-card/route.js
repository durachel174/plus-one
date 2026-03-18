// app/api/test-dinner-card/route.js
// (or pages/api/test-dinner-card.js if using Pages Router — see note at bottom)

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY, // never exposed to client
});

const SYSTEM_PROMPT = `You are generating Dinner Card content for Plus One, a curated social dining app.

A Dinner Card helps potential guests understand the vibe of a dinner before requesting a seat. It should feel warm, specific, and written like a thoughtful person — not a product description.

Rules:
- card_title: "Restaurant — Day Time" format. Clean, no punctuation flourishes.
- card_summary: Exactly 2 sentences. Describe the experience, not just the food. What will the night feel like?
- card_good_match: Array of exactly 3 short phrases (5 words or fewer each). Start each with a verb or adjective.
- dining_style: one of tasting_menu | casual | fine_dining | street_food | mixed
- social_energy: one of low_key | moderate | social

Return ONLY valid JSON. No markdown, no explanation, no extra fields.

Example output:
{
  "card_title": "State Bird Provisions — Saturday 7 PM",
  "card_summary": "One open seat for a creative small plates dinner. Ideal for someone who enjoys inventive seasonal cooking and unhurried conversation.",
  "card_good_match": ["Loves tasting menus", "Prefers quieter rooms", "Curious about SF food"],
  "dining_style": "tasting_menu",
  "social_energy": "low_key"
}`;

// function extractOccasion(note) {
//   if (!note) return null;
//   const occasions = [
//     { keywords: ["birthday"], label: "birthday dinner" },
//     { keywords: ["anniversary"], label: "anniversary dinner" },
//     { keywords: ["celebration", "celebrate"], label: "celebration dinner" },
//     { keywords: ["farewell", "going away"], label: "farewell dinner" },
//     { keywords: ["date night", "date"], label: "date night" },
//     { keywords: ["work trip", "business"], label: "business dinner" },
//   ];

//   const lower = note.toLowerCase();
//   for (const { keywords, label } of occasions) {
//     if (keywords.some((k) => lower.includes(k))) return label;
//   }
//   return null;
// }

// function buildUserPrompt(fields, restaurantContext) {
//   const note = fields.note ?? fields.host_note_raw;
//   const occasion = extractOccasion(note);

//   return `The host wrote this about their dinner:
// "${note}"
// ${occasion ? `\nThis is a ${occasion} — the card_summary must reflect this.` : ""}
// ${restaurantContext ? `\nAbout the restaurant: ${restaurantContext}` : ""}

// Now generate a Dinner Card for:
// Restaurant: ${fields.restaurant}
// Date/time: ${fields.date} at ${fields.time}
// Price range: ${fields.price ?? fields.price_range}`;
// }

function buildUserPrompt(fields) {
  return `Restaurant: ${fields.restaurant}
Date/time: ${fields.date} at ${fields.time}
Price range: ${fields.price ?? fields.price_range}
Host note: ${fields.note ?? fields.host_note_raw}`;
}

// Strict validation against the spec schema
function validateResult(parsed) {
  const errors = [];

  if (!parsed.card_title || typeof parsed.card_title !== "string") {
    errors.push("card_title missing or not a string");
  } else if (!parsed.card_title.includes("—") && !parsed.card_title.includes("-")) {
    errors.push("card_title missing '—' separator");
  }

  if (!parsed.card_summary || typeof parsed.card_summary !== "string") {
    errors.push("card_summary missing or not a string");
  } else {
    const sentences = parsed.card_summary
      .split(/(?<=[.!?])\s+/)
      .filter((s) => s.trim().length > 0);
    if (sentences.length !== 2) {
      errors.push(`card_summary has ${sentences.length} sentence(s), expected exactly 2`);
    }
  }

  if (!Array.isArray(parsed.card_good_match)) {
    errors.push("card_good_match must be an array");
  } else if (parsed.card_good_match.length !== 3) {
    errors.push(`card_good_match has ${parsed.card_good_match.length} item(s), expected exactly 3`);
  }

  const validStyles = ["tasting_menu", "casual", "fine_dining", "street_food", "mixed"];
  if (!validStyles.includes(parsed.dining_style)) {
    errors.push(`dining_style '${parsed.dining_style}' not in allowed values`);
  }

  const validEnergy = ["low_key", "moderate", "social"];
  if (!validEnergy.includes(parsed.social_energy)) {
    errors.push(`social_energy '${parsed.social_energy}' not in allowed values`);
  }

  return errors;
}

// Attempt to parse JSON from model output, handling common failure modes
function safeParseJSON(raw) {
  // 1. Strip markdown code fences if present
  let cleaned = raw.replace(/```(?:json)?\n?/g, "").trim();

  // 2. Try direct parse first
  try {
    return { parsed: JSON.parse(cleaned), raw: cleaned, method: "direct" };
  } catch (_) {}

  // 3. Try extracting the first {...} block
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return { parsed: JSON.parse(match[0]), raw: cleaned, method: "extracted" };
    } catch (_) {}
  }

  // 4. Give up — return the raw text for debugging
  return { parsed: null, raw: cleaned, method: "failed" };
}

export async function POST(request) {
  // Input validation
  const body = await request.json().catch(() => null);
  if (!body) {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { restaurant, date, time, price, price_range, note, host_note_raw } = body;
  if (!restaurant || (!note && !host_note_raw)) {
    return Response.json(
      { error: "restaurant and note are required fields" },
      { status: 400 }
    );
  }

  // FIX: Resolve note once here so all downstream uses are consistent
  const resolvedNote = note ?? host_note_raw;
  const resolvedPrice = price ?? price_range;

  const startTime = Date.now();

  try {
    console.log("--- PROMPT SENT ---");
    // FIX: Use resolvedNote in the console.log too
    console.log(buildUserPrompt({ restaurant, date, time, price: resolvedPrice, note: resolvedNote }));

    // Get restaurant context first
    // let restaurantContext = null;
    // try {
    //   const contextMsg = await client.messages.create({
    //     model: "claude-sonnet-4-20250514",
    //     max_tokens: 100,
    //     messages: [{
    //       role: "user",
    //       content: `In one sentence, describe the dining experience at ${restaurant} in SF. Focus on food style and atmosphere only. No opinions.`
    //     }]
    //   });
    //   restaurantContext = contextMsg.content?.[0]?.text?.trim();
    // } catch (_) {
    //   // silent fail
    // }

    // const message = await client.messages.create({
    //   model: "claude-sonnet-4-20250514",
    //   max_tokens: 1000,
    //   // FIX: Move system prompt to the dedicated system field
    //   system: SYSTEM_PROMPT,
    //   messages: [
    //     {
    //       role: "user",
    //       // FIX: Pass resolvedNote so the host's note is always included,
    //       // and pass restaurantContext as the second argument where it belongs
    //       content: buildUserPrompt(
    //         { restaurant, date, time, price: resolvedPrice, note: resolvedNote },
    //         restaurantContext
    //       ),
    //     },
    //   ],
    // });

    const message = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{
            role: "user",
            content: buildUserPrompt({
            restaurant,
            date,
            time,
            price: resolvedPrice,
            note: resolvedNote,
            }),
        }],
        });

    const rawText = message.content?.[0]?.text ?? "";
    const elapsed = Date.now() - startTime;

    const { parsed, raw: cleanedRaw, method: parseMethod } = safeParseJSON(rawText);

    if (!parsed) {
      // Parse failed — return raw for debugging, don't crash
      return Response.json({
        success: false,
        error: "Model returned unparseable output",
        raw: cleanedRaw,
        elapsed,
        parseMethod,
        usage: message.usage,
      });
    }

    const validationErrors = validateResult(parsed);

    return Response.json({
      success: true,
      result: parsed,
      validationErrors,   // empty array = clean pass
      raw: cleanedRaw,
      elapsed,
      parseMethod,
      usage: message.usage, // input_tokens, output_tokens — useful for cost tracking
    });

  } catch (err) {
    console.error("Full error:", err);
    const elapsed = Date.now() - startTime;

    // Distinguish API errors from unexpected errors
    const isAnthropicError = err?.status !== undefined;

    return Response.json(
      {
        success: false,
        error: isAnthropicError
          ? `Anthropic API error ${err.status}: ${err.message}`
          : `Unexpected error: ${err.message}`,
        elapsed,
      },
      { status: isAnthropicError ? err.status : 500 }
    );
  }
}

// ── If using Pages Router instead of App Router ──────────────────────────────
// Replace the export above with:
//
// export default async function handler(req, res) {
//   if (req.method !== "POST") return res.status(405).end();
//   // ... same logic, using res.status(200).json(...) instead of Response.json(...)
// }
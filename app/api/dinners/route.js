import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `You are generating Dinner Card content for Plus One, a curated social dining app.

A Dinner Card helps potential guests understand the vibe of a dinner before requesting a seat. It should feel warm, specific, and written like a thoughtful person — not a product description.

Rules:
- card_title: "Restaurant — Day Time" format. Clean, no punctuation flourishes.
- card_summary: Exactly 2 sentences. Describe the experience, not just the food. What will the night feel like?
- card_good_match: Array of exactly 3 short phrases (5 words or fewer each). Start each with a verb or adjective.
- dining_style: one of tasting_menu | casual | fine_dining | street_food | mixed
- social_energy: one of low_key | moderate | social

Return ONLY valid JSON. No markdown, no explanation, no extra fields.`;

function safeParseJSON(raw) {
  let cleaned = raw.replace(/```(?:json)?\n?/g, "").trim();
  try { return JSON.parse(cleaned); } catch (_) {}
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (match) { try { return JSON.parse(match[0]); } catch (_) {} }
  return null;
}

import { createClient } from "@/lib/supabase-server";

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid request body" }, { status: 400 });

  const { restaurant, date, time, price_range, seats_open, host_note_raw, launch_mode, card_data } = body;

  if (!restaurant || !host_note_raw) {
    return Response.json({ error: "restaurant and host_note_raw are required" }, { status: 400 });
  }

  // 1 — Generate the Dinner Card via AI
  let cardData = card_data ?? null;
  if (!cardData) try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `${SYSTEM_PROMPT}\n\n---\n\nRestaurant: ${restaurant}\nDate/time: ${date} at ${time}\nPrice range: ${price_range}\nHost note: ${host_note_raw}`,
      }],
    });
    cardData = safeParseJSON(message.content?.[0]?.text ?? "");
  } catch (e) {
    // AI failed — continue without card data, store raw note
    console.error("AI card generation failed:", e.message);
  }

  // 2 — Determine dinner status from launch mode
  const status = launch_mode === "publish" ? "open" : "interest_check";

  // 3 — Store in Supabase
  const { data, error } = await supabaseAdmin
    .from("dinners")
    .insert({
      restaurant,
      host_id: user.id,
      date_time: null,
      date_text: date && time ? `${date} ${time}` : null,
      price_range,
      seats_open: seats_open || 1,
      host_note_raw,
      card_title: cardData?.card_title ?? null,
      card_summary: cardData?.card_summary ?? null,
      card_good_match: cardData?.card_good_match ?? null,
      dining_style: cardData?.dining_style ?? null,
      social_energy: cardData?.social_energy ?? null,
      status,
    })
    .select()
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    return Response.json({ error: "Failed to save dinner" }, { status: 500 });
  }

  return Response.json({ success: true, dinner: data }, { status: 201 });
}

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("dinners")
    .select("*")
    .in("status", ["open", "interest_check"])
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ dinners: data });
}
import Anthropic from "@anthropic-ai/sdk";
import { supabaseAdmin } from "@/lib/supabase";
import { createClient } from "@/lib/supabase-server";

const client = new Anthropic();

function buildBioPrompt(app) {
  const parts = [];

  const spots = app.goto_spots?.filter(Boolean) ?? [];
  const wishlist = app.wishlist?.filter(Boolean) ?? [];

  if (spots.length) parts.push(`Go-to restaurants: ${spots.join(", ")}`);
  if (wishlist.length) parts.push(`Wants to try: ${wishlist.join(", ")}`);
  if (app.cuisines?.length) parts.push(`Cuisine preferences: ${app.cuisines.join(", ")}`);
  if (app.price_range) parts.push(`Typical spend: ${app.price_range}`);
  if (app.dining_style) parts.push(`Dining style: ${app.dining_style}`);
  if (app.intent?.length) parts.push(`What brings them here: ${app.intent.join("; ")}`);
  if (app.weekend) parts.push(`A good weekend looks like: ${app.weekend}`);
  if (app.note) parts.push(`In their own words: ${app.note}`);

  return parts.join("\n");
}

export async function POST(request) {
  // Verify the caller is an approved host or admin
  // For now: simple secret header check — replace with proper admin auth later
  const secret = request.headers.get("x-admin-secret");
  if (secret !== process.env.ADMIN_SECRET) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.user_id) {
    return Response.json({ error: "user_id required" }, { status: 400 });
  }

  const { user_id } = body;

  // Fetch membership application
  const { data: app, error: appError } = await supabaseAdmin
    .from("membership_requests")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (appError || !app) {
    return Response.json({ error: "Membership application not found" }, { status: 404 });
  }

  // Generate bio
  let bio = null;
  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 120,
      messages: [{
        role: "user",
        content: `Write a 2-sentence bio for a member of a curated social dining club based on their application answers. 

Rules:
- Write in third person
- Focus on taste and dining personality, not demographics
- Specific and warm — should feel like something a thoughtful person wrote, not a system
- No more than 40 words total
- No quotation marks, no preamble — just the bio

Application:
${buildBioPrompt(app)}

Bio:`,
      }],
    });

    bio = message.content[0]?.text?.trim() ?? null;
  } catch (e) {
    console.error("Bio generation failed:", e.message);
    // Continue without bio — approval still goes through
  }

  // Approve — write bio + status in one update
  const { error: updateError } = await supabaseAdmin
    .from("profiles")
    .update({
      membership_status: "approved",
      ...(bio ? { bio } : {}),
    })
    .eq("id", user_id);

  if (updateError) {
    console.error("Profile update error:", updateError);
    return Response.json({ error: "Failed to approve user" }, { status: 500 });
  }

  // Also mark the membership_request as approved
  await supabaseAdmin
    .from("membership_requests")
    .update({ status: "approved" })
    .eq("user_id", user_id);

  return Response.json({ success: true, bio });
}
import { supabaseAdmin } from "@/lib/supabase";
import { createClient } from "@/lib/supabase-server";

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid request body" }, { status: 400 });

  const {
    goto_spots, wishlist, cuisines, price_range,
    dining_style, intent, weekend, note,
  } = body;

  // Save membership request
  const { error: insertError } = await supabaseAdmin
    .from("membership_requests")
    .insert({
      user_id: user?.id ?? null,
      goto_spots, wishlist, cuisines, price_range,
      dining_style, intent, weekend, note,
      status: "pending",
    });

  if (insertError) {
    console.error("Membership insert error:", insertError);
    return Response.json({ error: "Failed to save request" }, { status: 500 });
  }

  // Update profile flag if user is logged in
  if (user) {
    await supabaseAdmin
      .from("profiles")
      .update({ membership_status: "pending" })
      .eq("id", user.id);
  }

  return Response.json({ success: true }, { status: 201 });
}
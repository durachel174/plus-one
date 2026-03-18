import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid request body" }, { status: 400 });

  const {
    goto_spots,
    wishlist,
    cuisines,
    price_range,
    dining_style,
    intent,
    weekend,
    note,
  } = body;

  const { data, error } = await supabaseAdmin
    .from("membership_requests")
    .insert({
      goto_spots,
      wishlist,
      cuisines,
      price_range,
      dining_style,
      intent,
      weekend,
      note,
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("Membership insert error:", error);
    return Response.json({ error: "Failed to save request" }, { status: 500 });
  }

  return Response.json({ success: true, id: data.id }, { status: 201 });
}
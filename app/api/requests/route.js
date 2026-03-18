import { supabaseAdmin } from "@/lib/supabase";
import { createClient } from "@/lib/supabase-server";

export async function POST(request) {
    const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid request body" }, { status: 400 });

  const { dinner_id, message } = body;

  if (!dinner_id || !message) {
    return Response.json({ error: "dinner_id and message are required" }, { status: 400 });
  }

  // Check dinner exists and has seats
  const { data: dinner, error: dinnerError } = await supabaseAdmin
    .from("dinners")
    .select("id, seats_open, status")
    .eq("id", dinner_id)
    .single();

  if (dinnerError || !dinner) {
    return Response.json({ error: "Dinner not found" }, { status: 404 });
  }

  if (dinner.seats_open < 1) {
    return Response.json({ error: "No seats available" }, { status: 409 });
  }

  // Save request
  const { data, error } = await supabaseAdmin
    .from("requests")
    .insert({
      dinner_id,
      guest_id: user.id,
      message,
      moderation_status: "pending",
      status: "pending",
    })
    .select()
    .single();

  if (error) {
    console.error("Supabase insert error:", error);
    return Response.json({ error: "Failed to save request" }, { status: 500 });
  }

  return Response.json({ success: true, request: data }, { status: 201 });
}
import { supabaseAdmin } from "@/lib/supabase";
import { createClient } from "@/lib/supabase-server";

export async function GET(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const dinner_id = searchParams.get("dinner_id");

  if (!dinner_id) return Response.json({ error: "dinner_id required" }, { status: 400 });

  // Verify the requesting user is the host of this dinner
  const { data: dinner } = await supabaseAdmin
    .from("dinners")
    .select("host_id")
    .eq("id", dinner_id)
    .single();

  if (!dinner || dinner.host_id !== user.id) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Fetch requests with guest profile
  const { data: requests, error } = await supabaseAdmin
    .from("requests")
    .select(`
      id,
      message,
      guest_answer,
      status,
      created_at,
      guest_id,
      profiles:guest_id (
        full_name,
        bio
      )
    `)
    .eq("dinner_id", dinner_id)
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ requests });
}

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json().catch(() => null);
  if (!body) return Response.json({ error: "Invalid request body" }, { status: 400 });

  const { dinner_id, message, guest_answer } = body;

  if (!dinner_id || !message) {
    return Response.json({ error: "dinner_id and message are required" }, { status: 400 });
  }

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

  const { data, error } = await supabaseAdmin
    .from("requests")
    .insert({
      dinner_id,
      guest_id: user.id,
      message,
      guest_answer: guest_answer || null,
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

export async function PATCH(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const { request_id, status } = body ?? {};

  if (!request_id || !["accepted", "passed"].includes(status)) {
    return Response.json({ error: "request_id and valid status required" }, { status: 400 });
  }

  // Verify the user is the host of the dinner this request belongs to
  const { data: req } = await supabaseAdmin
    .from("requests")
    .select("dinner_id")
    .eq("id", request_id)
    .single();

  if (!req) return Response.json({ error: "Request not found" }, { status: 404 });

  const { data: dinner } = await supabaseAdmin
    .from("dinners")
    .select("host_id")
    .eq("id", req.dinner_id)
    .single();

  if (!dinner || dinner.host_id !== user.id) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { error } = await supabaseAdmin
    .from("requests")
    .update({ status })
    .eq("id", request_id);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ success: true });
}
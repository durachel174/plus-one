import { supabaseAdmin } from "@/lib/supabase";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // 1 — Dinners you're attending as a guest (accepted requests)
  const { data: guestRequests } = await supabaseAdmin
    .from("requests")
    .select(`
      id,
      dinner_id,
      dinners:dinner_id (
        id, restaurant, date_text,
        profiles:host_id (full_name)
      )
    `)
    .eq("guest_id", user.id)
    .eq("status", "accepted");

  // 2 — Your hosted dinners that have accepted guests
  const { data: myDinners } = await supabaseAdmin
    .from("dinners")
    .select("id, restaurant, date_text")
    .eq("host_id", user.id);

  const myDinnerIds = (myDinners ?? []).map((d) => d.id);

  let hostUpcoming = [];
  if (myDinnerIds.length > 0) {
    const { data: hostRequests } = await supabaseAdmin
      .from("requests")
      .select(`
        id,
        dinner_id,
        profiles:guest_id (full_name)
      `)
      .in("dinner_id", myDinnerIds)
      .eq("status", "accepted");

    // Build a map of dinner_id → dinner for quick lookup
    const dinnerMap = Object.fromEntries((myDinners ?? []).map((d) => [d.id, d]));

    hostUpcoming = (hostRequests ?? []).map((r) => ({
      request_id: r.id,
      dinner_id: r.dinner_id,
      restaurant: dinnerMap[r.dinner_id]?.restaurant,
      date_text: dinnerMap[r.dinner_id]?.date_text,
      other_name: r.profiles?.full_name ?? null,
      role: "host",
    }));
  }

  const guestUpcoming = (guestRequests ?? []).map((r) => ({
    request_id: r.id,
    dinner_id: r.dinner_id,
    restaurant: r.dinners?.restaurant,
    date_text: r.dinners?.date_text,
    other_name: r.dinners?.profiles?.full_name ?? null,
    role: "guest",
  }));

  // Deduplicate by dinner_id (in case someone is both host and guest somehow)
  const seen = new Set();
  const upcoming = [...hostUpcoming, ...guestUpcoming].filter((d) => {
    if (seen.has(d.dinner_id)) return false;
    seen.add(d.dinner_id);
    return true;
  });

  return Response.json({ upcoming });
}
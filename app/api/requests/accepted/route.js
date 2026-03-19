import { supabaseAdmin } from "@/lib/supabase";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("requests")
    .select(`
      id,
      dinner_id,
      dinners:dinner_id (
        id,
        restaurant,
        date_text,
        host_id,
        profiles:host_id (full_name)
      )
    `)
    .eq("guest_id", user.id)
    .eq("status", "accepted")
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const upcoming = (data ?? []).map((r) => ({
    request_id: r.id,
    dinner_id: r.dinner_id,
    restaurant: r.dinners?.restaurant,
    date_text: r.dinners?.date_text,
    host_name: r.dinners?.profiles?.full_name ?? null,
  }));

  return Response.json({ upcoming });
}
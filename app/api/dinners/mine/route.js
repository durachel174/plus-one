import { supabaseAdmin } from "@/lib/supabase";
import { createClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

  // Fetch host's dinners
  const { data: dinners, error } = await supabaseAdmin
    .from("dinners")
    .select("id, restaurant, date_text, status, host_question")
    .eq("host_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Attach pending request counts
  const withCounts = await Promise.all(
    dinners.map(async (d) => {
      const { count } = await supabaseAdmin
        .from("requests")
        .select("id", { count: "exact", head: true })
        .eq("dinner_id", d.id)
        .eq("status", "pending");

      return { ...d, pending_count: count ?? 0 };
    })
  );

  return Response.json({ dinners: withCounts });
}
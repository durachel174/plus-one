import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request, context) {
  const { id } = await context.params;

  const { data, error } = await supabaseAdmin
    .from("dinners")
    .select("*, profiles:host_id (full_name)")
    .eq("id", id)
    .single();

  if (error) return Response.json({ error: error.message }, { status: 404 });

  const dinner = { ...data, host_name: data.profiles?.full_name ?? null };

  return Response.json({ dinner });
}
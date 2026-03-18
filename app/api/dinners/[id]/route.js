import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request, context) {
  const { id } = await context.params;

  const { data, error } = await supabaseAdmin
    .from("dinners")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return Response.json({ error: error.message }, { status: 404 });

  return Response.json({ dinner: data });
}
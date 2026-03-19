import { supabaseAdmin } from "@/lib/supabase";
import { createClient } from "@/lib/supabase-server";

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const { email, password, full_name } = body ?? {};

  if (!email || !password || !full_name) {
    return Response.json({ error: "email, password, and full_name are required" }, { status: 400 });
  }

  // Create the user via admin client
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    user_metadata: { full_name },
    email_confirm: false, // still requires email confirmation
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  // Write full_name to profiles using admin client — bypasses RLS
  if (data?.user) {
    await supabaseAdmin
      .from("profiles")
      .upsert({ id: data.user.id, full_name }, { onConflict: "id" });
  }

  return Response.json({ success: true });
}
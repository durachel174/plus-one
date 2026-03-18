"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export default function MembershipButton() {
  const router = useRouter();
  const supabase = createClient();
  const [destination, setDestination] = useState("/login");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        setDestination("/login");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("membership_status")
        .eq("id", user.id)
        .single();

      const status = profile?.membership_status;
      if (status === "approved") setDestination("/feed");
      else if (status === "pending") setDestination("/pending");
      else setDestination("/membership");
    });
  }, []);

  return (
    <button
      className="btn-primary"
      onClick={() => router.push(destination)}
    >
      Request membership
    </button>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export default function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const isActive = (path) => pathname === path || pathname.startsWith(path + "/");

  // Don't show nav on login page
  if (pathname === "/login") return null;

  return (
    <>
      <style>{css}</style>
      <nav className="nav">
        <div className="nav-logo" onClick={() => router.push("/feed")}>
          Plus One
        </div>

        <div className="nav-links">
          <button
            className={`nav-link ${isActive("/feed") ? "active" : ""}`}
            onClick={() => router.push("/feed")}
          >
            This week
          </button>
          <button
            className={`nav-link ${isActive("/host") ? "active" : ""}`}
            onClick={() => router.push("/host")}
          >
            Host a dinner
          </button>
        </div>

        <div className="nav-right">
          {user ? (
            <>
              <span className="nav-email">{user.email}</span>
              <button className="nav-signout" onClick={signOut}>
                Sign out
              </button>
            </>
          ) : (
            <button className="nav-link" onClick={() => router.push("/login")}>
              Sign in
            </button>
          )}
        </div>
      </nav>
    </>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=DM+Sans:wght@300;400;500&display=swap');

  .nav {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 40px; height: 60px;
    background: #080808;
    border-bottom: 1px solid #232323;
  }

  .nav-logo {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px; font-weight: 400; letter-spacing: 0.12em;
    text-transform: uppercase; color: #F0EAE0;
    cursor: pointer; flex-shrink: 0;
  }

  .nav-links { display: flex; gap: 2px; }

  .nav-link {
    padding: 6px 16px; font-size: 11px; letter-spacing: 0.1em;
    text-transform: uppercase; cursor: pointer;
    border: 1px solid transparent; color: #6A6560;
    background: none; font-family: 'DM Sans', sans-serif; font-weight: 300;
    transition: color 0.2s, border-color 0.2s;
  }
  .nav-link:hover { color: #F0EAE0; }
  .nav-link.active { color: #F0EAE0; border-color: #2E2E2E; }

  .nav-right { display: flex; align-items: center; gap: 16px; flex-shrink: 0; }

  .nav-email {
    font-size: 11px; color: #3A3530; letter-spacing: 0.03em;
    max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  }

  .nav-signout {
    font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
    color: #6A6560; background: none; border: none; cursor: pointer;
    font-family: 'DM Sans', sans-serif; transition: color 0.2s;
  }
  .nav-signout:hover { color: #F0EAE0; }
`;
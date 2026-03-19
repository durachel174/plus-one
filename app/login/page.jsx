"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (mode === "signup") {
        // Use server route so admin client can write full_name to profiles reliably
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, full_name: name }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Signup failed");
        setSuccess("Check your email to confirm your account.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const { data: { user } } = await supabase.auth.getUser();
        const { data: profile } = await supabase
          .from("profiles")
          .select("membership_status")
          .eq("id", user.id)
          .single();

        const status = profile?.membership_status;
        if (status === "approved") router.push("/feed");
        else if (status === "pending") router.push("/pending");
        else router.push("/membership");
        router.refresh();
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  const canSubmit = email && password && (mode === "login" || name.trim());

  return (
    <>
      <style>{css}</style>
      <main className="login-page">
        <div className="login-box">
          <div className="login-logo">Plus One</div>
          <div className="login-title">
            {mode === "login" ? "Welcome back" : "Join the club"}
          </div>
          <p className="login-sub">
            {mode === "login"
              ? "Sign in to browse and host dinners."
              : "Create an account to get started."}
          </p>

          {mode === "signup" && (
            <div className="field">
              <label className="label">Your name</label>
              <input
                className="input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="First and last"
                autoComplete="name"
                autoFocus
              />
            </div>
          )}

          <div className="field">
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div className="field">
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="••••••••"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
            />
          </div>

          {error && <div className="login-error">{error}</div>}
          {success && <div className="login-success">{success}</div>}

          <button
            className="btn-submit"
            onClick={handleSubmit}
            disabled={loading || !canSubmit}
          >
            {loading ? "..." : mode === "login" ? "Sign in" : "Create account"}
          </button>

          <div className="login-switch">
            {mode === "login" ? (
              <>
                No account?{" "}
                <button className="btn-switch" onClick={() => { setMode("signup"); setError(null); }}>
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button className="btn-switch" onClick={() => { setMode("login"); setError(null); }}>
                  Sign in
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #080808; color: #F0EAE0; font-family: 'DM Sans', sans-serif; font-weight: 300; }

  .login-page { min-height: 100vh; display: grid; place-items: center; padding: 40px; }
  .login-box { width: 100%; max-width: 400px; }

  .login-logo { font-family: 'Cormorant Garamond', serif; font-size: 18px; letter-spacing: 0.12em; text-transform: uppercase; color: #F0EAE0; margin-bottom: 48px; }
  .login-title { font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 300; color: #F0EAE0; margin-bottom: 8px; }
  .login-sub { font-size: 13px; color: #6A6560; line-height: 1.6; margin-bottom: 36px; }

  .field { margin-bottom: 18px; }
  .label { font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: #6A6560; margin-bottom: 7px; display: block; }
  .input { width: 100%; background: #0E0E0E; border: 1px solid #232323; color: #F0EAE0; font-family: 'DM Sans', sans-serif; font-weight: 300; font-size: 14px; padding: 11px 14px; outline: none; transition: border-color 0.2s; }
  .input:focus { border-color: #2E2E2E; }
  .input::placeholder { color: #3A3530; }

  .login-error { font-size: 12px; color: #8F4A42; border: 1px solid #8F4A42; padding: 10px 14px; margin-bottom: 16px; }
  .login-success { font-size: 12px; color: #6B8F72; border: 1px solid #6B8F72; padding: 10px 14px; margin-bottom: 16px; }

  .btn-submit { width: 100%; padding: 13px; background: #F0EAE0; color: #080808; border: none; font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; cursor: pointer; transition: background 0.2s; margin-bottom: 20px; }
  .btn-submit:hover:not(:disabled) { background: #FAFAF8; }
  .btn-submit:disabled { background: #1A1A1A; color: #3A3530; cursor: default; }

  .login-switch { font-size: 12px; color: #6A6560; text-align: center; }
  .btn-switch { background: none; border: none; color: #C9A96E; font-size: 12px; cursor: pointer; font-family: 'DM Sans', sans-serif; text-decoration: underline; padding: 0; }
  .btn-switch:hover { color: #F0EAE0; }
`;
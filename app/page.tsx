"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-client";
import Link from "next/link";

// Hook: fade + rise on scroll into view
function useReveal(options = {}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.15, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, visible] as const;
}

export default function Home() {
  const router = useRouter();
  const supabase = createClient();
  const [membershipDest, setMembershipDest] = useState("/login");

  // Reveal refs
  const [identityRef, identityVisible] = useReveal();
  const [howRef, howVisible] = useReveal();
  const [textureRef, textureVisible] = useReveal();
  const [manifestoRef, manifestoVisible] = useReveal();
  const [exploreRef, exploreVisible] = useReveal();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setMembershipDest("/login"); return; }
      const { data: profile } = await supabase
        .from("profiles")
        .select("membership_status")
        .eq("id", user.id)
        .single();
      const status = profile?.membership_status ?? null;
if (status === "approved") setMembershipDest("/feed");
else if (status === "pending") setMembershipDest("/pending");
else setMembershipDest("/membership");
    });
  }, []);

  return (
    <>
      <style>{css}</style>
      <main className="landing">

        {/* Hero */}
        <section className="hero">
          <div className="hero-bg" />
          <div className="hero-grain" />
          <div className="hero-inner">
            <div className="hero-kicker animate-rise" style={{ animationDelay: "0ms" }}>
              <span />
              San Francisco dining club · Membership by request
              <span />
            </div>
            <h1 className="hero-title animate-rise" style={{ animationDelay: "120ms" }}>
              A table<br />for <em>one more</em>
            </h1>
            <p className="hero-sub animate-rise" style={{ animationDelay: "260ms" }}>
              A private dining club for people who care about where they're going —
              and who they share the table with.
            </p>
            <button
              className="btn-primary animate-rise"
              style={{ animationDelay: "400ms" }}
              onClick={() => router.push(membershipDest)}
            >
              Request membership
            </button>
            <p className="hero-note animate-rise" style={{ animationDelay: "520ms" }}>
              We review each request to keep the club intentional.
            </p>
          </div>
        </section>

        {/* Identity */}
        <section className="identity" ref={identityRef}>
          <div className="identity-col">
            <div
              className={`identity-label ${identityVisible ? "animate-rise" : "pre-animate"}`}
              style={{ animationDelay: "0ms" }}
            >
              Best suited for people who
            </div>
            <ul className="identity-list">
              {[
                "care where they sit, not just where they eat",
                "notice the room, the pacing, the details",
                "believe the right company changes the night",
              ].map((item, i) => (
                <li
                  key={i}
                  className={identityVisible ? "animate-rise" : "pre-animate"}
                  style={{ animationDelay: `${80 + i * 100}ms` }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="identity-divider" />
          <div className="identity-col">
            <div
              className={`identity-label identity-label--not ${identityVisible ? "animate-rise" : "pre-animate"}`}
              style={{ animationDelay: "200ms" }}
            >
              Less suited for people who
            </div>
            <ul className="identity-list identity-list--not">
              {[
                "treat dinner like a transaction",
                "are looking for a date or a contact",
                "just want a reservation",
              ].map((item, i) => (
                <li
                  key={i}
                  className={identityVisible ? "animate-rise" : "pre-animate"}
                  style={{ animationDelay: `${280 + i * 100}ms` }}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* How it works */}
        <section className="how" ref={howRef}>
          {[
            {
              n: "I",
              title: "A seat opens",
              desc: "A reservation already exists. One seat becomes available. The host shares the restaurant, the time, and the kind of night they have in mind.",
              delay: 0,
            },
            {
              n: "II",
              title: "Requests come in",
              desc: "You see who wants to join, and why. You decide who feels right for that table.",
              delay: 150,
            },
            {
              n: "III",
              title: "The dinner happens",
              desc: "Once accepted, details are shared. No endless matching. No forced chemistry. Just a well-chosen evening.",
              delay: 300,
            },
          ].map((h) => (
            <div
              key={h.n}
              className={`how-cell ${howVisible ? "animate-rise" : "pre-animate"}`}
              style={{ animationDelay: `${h.delay}ms` }}
            >
              <div className="how-n">{h.n}</div>
              <div className="how-title">{h.title}</div>
              <p className="how-desc">{h.desc}</p>
            </div>
          ))}
        </section>

        {/* Cultural texture */}
        <section className="texture" ref={textureRef}>
          <div className="texture-inner">
            {[
              { text: "One open seat at a candlelit wine bar.", dim: false, delay: 0 },
              { text: "A last-minute tasting menu at 8:15.", dim: false, delay: 200 },
              { text: "An omakase counter someone didn't want to waste on the wrong company.", dim: true, delay: 400 },
            ].map(({ text, dim, delay }, i) => (
              <p
                key={i}
                className={`texture-line${dim ? " texture-line--dim" : ""} ${textureVisible ? "animate-fade" : "pre-animate"}`}
                style={{ animationDelay: `${delay}ms` }}
              >
                {text}
              </p>
            ))}
          </div>
        </section>

        {/* Manifesto */}
        <section className="manifesto" ref={manifestoRef}>
          <div className="manifesto-inner">
            {[
              { text: "Not a date.", gold: false, delay: 0 },
              { text: "Not networking.", gold: false, delay: 300 },
              { text: "Not a group dinner.", gold: false, delay: 600 },
              { text: <>Just a seat at the right table,<br />offered to the right person.</>, gold: true, delay: 1000 },
            ].map(({ text, gold, delay }, i) => (
              <p
                key={i}
                className={`manifesto-line${gold ? " manifesto-line--gold" : ""} ${manifestoVisible ? "animate-fade" : "pre-animate"}`}
                style={{ animationDelay: `${delay}ms` }}
              >
                {text}
              </p>
            ))}
          </div>
        </section>

        {/* Explore */}
        <section className="explore" ref={exploreRef}>
          <div
            className={`explore-inner ${exploreVisible ? "animate-rise" : "pre-animate"}`}
            style={{ animationDelay: "0ms" }}
          >
            <div className="explore-label">A glimpse inside</div>
            <p className="explore-desc">
              See how dinners are shared and what hosting looks like before applying.
            </p>
            <div className="explore-links">
              <Link href="/feed" className="btn-ghost">View sample dinners</Link>
              <Link href="/host-preview" className="btn-ghost">See a host preview</Link>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #080808; color: #F0EAE0; font-family: 'DM Sans', sans-serif; font-weight: 300; }

  /* ── ANIMATIONS ── */
  @keyframes riseIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .pre-animate { opacity: 0; }

  .animate-rise {
    opacity: 0;
    animation: riseIn 700ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
  }
  .animate-fade {
    opacity: 0;
    animation: fadeIn 800ms ease forwards;
  }

  /* ── LAYOUT ── */
  .landing { display: flex; flex-direction: column; }

  /* ── HERO ── */
  .hero {
    min-height: calc(100vh - 60px);
    display: flex; align-items: center; justify-content: center;
    padding: 80px 40px; position: relative; overflow: hidden;
  }
  .hero-bg {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 100% 80% at 50% 60%, #1A1208 0%, #080808 65%);
    pointer-events: none;
  }
  .hero-grain {
    position: absolute; inset: 0; opacity: 0.025; pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }
  .hero-inner {
    position: relative; z-index: 1;
    max-width: 640px; text-align: center;
    display: flex; flex-direction: column; align-items: center;
  }
  .hero-kicker {
    font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase;
    color: #8A6E44; margin-bottom: 40px;
    display: flex; align-items: center; gap: 16px;
  }
  .hero-kicker span { display: block; width: 32px; height: 1px; background: #3A3530; }
  .hero-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(64px, 10vw, 108px);
    font-weight: 300; line-height: 0.95;
    color: #F0EAE0; letter-spacing: -0.01em; margin-bottom: 32px;
  }
  .hero-title em { font-style: italic; color: #C9A96E; }
  .hero-sub {
    font-size: 15px; font-weight: 300; color: #6A6560;
    line-height: 1.8; max-width: 400px; margin-bottom: 48px; letter-spacing: 0.02em;
  }
  .btn-primary {
    padding: 15px 48px; background: #F0EAE0; color: #080808;
    font-family: 'DM Sans', sans-serif; font-weight: 500;
    font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase;
    border: none; cursor: pointer; transition: background 0.2s;
    margin-bottom: 16px; display: inline-block;
  }
  .btn-primary:hover { background: #FAFAF8; }
  .hero-note { font-size: 11px; color: #3A3530; letter-spacing: 0.04em; line-height: 1.6; }

  /* ── IDENTITY ── */
  .identity { border-top: 1px solid #232323; display: grid; grid-template-columns: 1fr 1px 1fr; }
  .identity-col { padding: 64px 56px; }
  .identity-divider { background: #232323; }
  .identity-label {
    font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase;
    color: #C9A96E; margin-bottom: 28px;
  }
  .identity-label--not { color: #3A3530; }
  .identity-list { list-style: none; display: flex; flex-direction: column; gap: 14px; }
  .identity-list li {
    font-size: 14px; color: #6A6560; line-height: 1.6; font-weight: 300;
    padding-left: 16px; position: relative;
  }
  .identity-list li::before { content: '—'; position: absolute; left: 0; color: #C9A96E; font-size: 12px; }
  .identity-list--not li { color: #3A3530; }
  .identity-list--not li::before { color: #2E2E2E; }

  /* ── HOW ── */
  .how { display: grid; grid-template-columns: 1fr 1fr 1fr; border-top: 1px solid #232323; }
  .how-cell { padding: 56px 48px; border-right: 1px solid #232323; }
  .how-cell:last-child { border-right: none; }
  .how-n {
    font-family: 'Cormorant Garamond', serif; font-size: 11px;
    letter-spacing: 0.2em; color: #3A3530; margin-bottom: 20px; text-transform: uppercase;
  }
  .how-title {
    font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 400;
    color: #C8C8C8; margin-bottom: 14px;
  }
  .how-desc { font-size: 13px; color: #6A6560; line-height: 1.75; font-weight: 300; }

  /* ── TEXTURE ── */
  .texture { border-top: 1px solid #232323; padding: 80px 40px; display: flex; justify-content: center; }
  .texture-inner { text-align: center; }
  .texture-line {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(18px, 3vw, 26px);
    font-weight: 300; font-style: italic; color: #6A6560; line-height: 1.8; letter-spacing: 0.02em;
  }
  .texture-line--dim { color: #3A3530; }

  /* ── MANIFESTO ── */
  .manifesto { border-top: 1px solid #1A1A1A; padding: 100px 40px; display: flex; justify-content: center; }
  .manifesto-inner { text-align: center; }
  .manifesto-line {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(28px, 4vw, 44px);
    font-weight: 300; color: #2E2E2E; line-height: 1.4; letter-spacing: -0.01em;
  }
  .manifesto-line--gold { color: #C9A96E; font-style: italic; margin-top: 8px; }

  /* ── EXPLORE ── */
  .explore { border-top: 1px solid #141414; padding: 56px 40px; display: flex; justify-content: center; }
  .explore-inner { text-align: center; max-width: 400px; }
  .explore-label { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #2E2E2E; margin-bottom: 10px; }
  .explore-desc { font-size: 12px; color: #2E2E2E; line-height: 1.7; margin-bottom: 20px; }
  .explore-links { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
  .btn-ghost {
    padding: 9px 20px; background: transparent; color: #2E2E2E;
    border: 1px solid #1A1A1A;
    font-family: 'DM Sans', sans-serif; font-weight: 300;
    font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
    text-decoration: none; transition: all 0.2s; display: inline-block;
  }
  .btn-ghost:hover { color: #6A6560; border-color: #232323; }
`;
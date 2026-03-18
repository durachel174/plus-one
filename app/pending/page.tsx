"use client";
import Link from "next/link";

export default function PendingPage() {
  return (
    <>
      <style>{css}</style>
      <main className="pending-page">
        <div className="pending-inner">
          <div className="pending-kicker">Membership</div>
          <h1 className="pending-title">Your request is under review</h1>
          <p className="pending-sub">
            We review requests to keep dinners feeling right.<br />
            You'll hear back soon.
          </p>
          <div className="pending-links">
            <Link href="/feed" className="btn-outline">Browse this week's dinners</Link>
            <Link href="/host-preview" className="btn-ghost">See how hosting works</Link>
          </div>
        </div>
      </main>
    </>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&family=DM+Sans:wght@300;400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #080808; color: #F0EAE0; font-family: 'DM Sans', sans-serif; font-weight: 300; }
  .pending-page { min-height: 100vh; display: grid; place-items: center; padding: 40px; }
  .pending-inner { max-width: 440px; text-align: center; }
  .pending-kicker { font-size: 10px; letter-spacing: 0.24em; text-transform: uppercase; color: #8A6E44; margin-bottom: 16px; }
  .pending-title { font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 300; color: #F0EAE0; margin-bottom: 14px; line-height: 1.2; }
  .pending-sub { font-size: 14px; color: #6A6560; line-height: 1.8; margin-bottom: 36px; font-weight: 300; }
  .pending-links { display: flex; flex-direction: column; gap: 10px; align-items: center; }
  .btn-outline { padding: 11px 28px; border: 1px solid #2E2E2E; color: #6A6560; font-family: 'DM Sans', sans-serif; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; text-decoration: none; transition: all 0.2s; display: inline-block; }
  .btn-outline:hover { color: #F0EAE0; border-color: #6A6560; }
  .btn-ghost { padding: 11px 28px; color: #3A3530; font-family: 'DM Sans', sans-serif; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; text-decoration: none; transition: color 0.2s; }
  .btn-ghost:hover { color: #6A6560; }
`;
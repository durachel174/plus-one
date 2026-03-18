"use client";

import { useState } from "react";

export default function MockHostPage() {
  const [fields, setFields] = useState({
    restaurant: "",
    date: "",
    time: "",
    price_range: "$$$",
    host_note_raw: "",
  });

  const [cardPreview, setCardPreview] = useState(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const set = (k, v) => setFields((f) => ({ ...f, [k]: v }));

  const generateCard = async () => {
    if (!fields.host_note_raw.trim() || !fields.restaurant.trim()) return;
    setCardLoading(true);
    setCardPreview(null);

    try {
      const res = await fetch("/api/test-dinner-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      const data = await res.json();
      if (data.success) {
        setCardPreview({ ...data.result, ...fields });
        setGenerated(true);
      }
    } catch (_) {
    } finally {
      setCardLoading(false);
    }
  };

  const tags = cardPreview?.card_good_match
    ? Array.isArray(cardPreview.card_good_match)
      ? cardPreview.card_good_match
      : cardPreview.card_good_match.split("|").map((s) => s.trim())
    : [];

  return (
    <>
      <style>{css}</style>
      <main className="mock-page">

        {/* Left — form */}
        <div className="mock-form">
          <div className="form-header">
            <div className="form-kicker">Preview</div>
            <h1 className="form-title">See how your dinner gets listed</h1>
            <p className="form-desc">
              Fill in a dinner you'd actually host. We'll generate your Dinner Card —
              the same way it would appear to guests once you're a member.
            </p>
          </div>

          <div className="field">
            <label className="label">Restaurant</label>
            <input
              className="input"
              value={fields.restaurant}
              onChange={(e) => set("restaurant", e.target.value)}
              placeholder="e.g. State Bird Provisions"
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label className="label">Date</label>
              <input
                className="input"
                value={fields.date}
                onChange={(e) => set("date", e.target.value)}
                placeholder="e.g. Saturday, April 5"
              />
            </div>
            <div className="field">
              <label className="label">Time</label>
              <input
                className="input"
                value={fields.time}
                onChange={(e) => set("time", e.target.value)}
                placeholder="e.g. 7:30 PM"
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Price range</label>
            <select
              className="input"
              value={fields.price_range}
              onChange={(e) => set("price_range", e.target.value)}
            >
              <option>$</option>
              <option>$$</option>
              <option>$$$</option>
              <option>$$$$</option>
            </select>
          </div>

          <div className="field">
            <label className="label">Why this dinner?</label>
            <textarea
              className="textarea"
              value={fields.host_note_raw}
              onChange={(e) => set("host_note_raw", e.target.value)}
              placeholder="Write freely — why did you book this place? What kind of night do you have in mind? The more you share, the better your card."
            />
          </div>

          <div className="field-hint">
            Your Dinner Card generates from what you write — not just the restaurant name.
          </div>

          <button
            className="btn-generate"
            onClick={generateCard}
            disabled={cardLoading || !fields.host_note_raw.trim() || !fields.restaurant.trim()}
          >
            {cardLoading ? "Generating..." : "Generate my Dinner Card →"}
          </button>

          {generated && (
            <div className="membership-nudge">
              <div className="nudge-title">Like what you see?</div>
              <p className="nudge-desc">
                Request membership to start hosting and joining dinners.
              </p>
              <a href="/membership" className="btn-membership">
                Request membership
              </a>
            </div>
          )}
        </div>

        {/* Right — card preview */}
        <div className="mock-preview">
          <div className="preview-label">Your Dinner Card</div>

          {!cardPreview && !cardLoading && (
            <div className="preview-empty">
              <div className="preview-empty-title">Your card will appear here</div>
              <div className="preview-empty-sub">
                Fill in a restaurant and a note, then click generate.
              </div>
            </div>
          )}

          {cardLoading && (
            <div className="card-skeleton">
              <div className="sk-top">
                <div className="sk sk-title" />
                <div className="sk sk-meta" />
              </div>
              <div className="sk-mid">
                <div className="sk sk-line" />
                <div className="sk sk-line sk-short" />
                <div className="sk-tags">
                  <div className="sk sk-tag" />
                  <div className="sk sk-tag" />
                  <div className="sk sk-tag" />
                </div>
              </div>
              <div className="sk-bot">
                <div className="sk sk-avatar" />
                <div className="sk sk-line sk-short" />
              </div>
            </div>
          )}

          {cardPreview && !cardLoading && (
            <div className="dcard">
              <div className="dcard-top">
                <div className="dcard-rest">
                  {cardPreview.card_title?.split("—")[0]?.trim() || cardPreview.restaurant}
                </div>
                <div className="dcard-meta">
                  <span>{cardPreview.card_title?.split("—")[1]?.trim() || `${cardPreview.date} · ${cardPreview.time}`}</span>
                  <span className="dcard-dot">·</span>
                  <span>{cardPreview.price_range}</span>
                </div>
              </div>
              <div className="dcard-mid">
                <p className="dcard-summary">{cardPreview.card_summary}</p>
                <div className="dcard-match-label">Good match if you</div>
                <div className="dcard-tags">
                  {tags.map((t, i) => (
                    <span key={i} className="dcard-tag">{t}</span>
                  ))}
                </div>
              </div>
              <div className="dcard-bot">
                <div className="dcard-av">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </svg>
                </div>
                <div>
                  <div className="dcard-hname">Hosted by you</div>
                  <div className="dcard-attrs">{cardPreview.dining_style} · {cardPreview.social_energy}</div>
                </div>
                <div className="dcard-seat">1 seat</div>
              </div>

              {/* What this shows */}
              <div className="dcard-note">
                This is exactly how your listing would appear to guests.
                AI generated this from what you wrote — not from the restaurant's reputation.
              </div>
            </div>
          )}
        </div>

      </main>
    </>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #080808; color: #F0EAE0; font-family: 'DM Sans', sans-serif; font-weight: 300; }

  .mock-page {
    display: grid; grid-template-columns: 1fr 1fr;
    min-height: 100vh; max-width: 1200px; margin: 0 auto;
  }

  /* ── FORM ── */
  .mock-form { padding: 64px 48px; border-right: 1px solid #232323; }

  .form-header { margin-bottom: 40px; }
  .form-kicker { font-size: 10px; letter-spacing: 0.24em; text-transform: uppercase; color: #8A6E44; margin-bottom: 10px; }
  .form-title { font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 300; color: #F0EAE0; line-height: 1.15; margin-bottom: 12px; }
  .form-desc { font-size: 13px; color: #6A6560; line-height: 1.7; font-weight: 300; }

  .field { margin-bottom: 20px; }
  .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
  .field-row .field { margin-bottom: 0; }
  .label { font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: #6A6560; margin-bottom: 7px; display: block; }
  .field-hint { font-size: 11px; color: #3A3530; margin-bottom: 20px; line-height: 1.6; }

  .input, .textarea {
    width: 100%; background: #0E0E0E; border: 1px solid #232323;
    color: #F0EAE0; font-family: 'DM Sans', sans-serif; font-weight: 300;
    font-size: 14px; padding: 11px 14px; outline: none; transition: border-color 0.2s;
  }
  .input:focus, .textarea:focus { border-color: #2E2E2E; }
  .input::placeholder, .textarea::placeholder { color: #3A3530; }
  .textarea { resize: vertical; min-height: 100px; line-height: 1.65; }

  .btn-generate {
    width: 100%; padding: 13px; background: #F0EAE0; color: #080808;
    border: none; font-family: 'DM Sans', sans-serif; font-weight: 500;
    font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase;
    cursor: pointer; transition: background 0.2s; margin-bottom: 28px;
  }
  .btn-generate:hover:not(:disabled) { background: #FAFAF8; }
  .btn-generate:disabled { background: #1A1A1A; color: #3A3530; cursor: default; }

  /* Membership nudge */
  .membership-nudge {
    padding: 20px 24px; border: 1px solid #2E2E2E;
    background: #0E0E0E;
  }
  .nudge-title { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 400; color: #F0EAE0; margin-bottom: 6px; }
  .nudge-desc { font-size: 12px; color: #6A6560; margin-bottom: 16px; line-height: 1.6; }
  .btn-membership {
    display: inline-block; padding: 10px 24px;
    border: 1px solid #C9A96E; color: #C9A96E;
    font-family: 'DM Sans', sans-serif; font-size: 11px;
    letter-spacing: 0.12em; text-transform: uppercase;
    text-decoration: none; transition: all 0.2s;
  }
  .btn-membership:hover { background: #C9A96E; color: #080808; }

  /* ── PREVIEW ── */
  .mock-preview { padding: 64px 48px; position: sticky; top: 60px; height: calc(100vh - 60px); overflow-y: auto; }

  .preview-label {
    font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase;
    color: #3A3530; margin-bottom: 16px;
    display: flex; align-items: center; gap: 10px;
  }
  .preview-label::after { content: ''; flex: 1; height: 1px; background: #1A1A1A; }

  .preview-empty { border: 1px solid #1A1A1A; padding: 48px 32px; text-align: center; }
  .preview-empty-title { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 300; color: #2E2E2E; margin-bottom: 8px; }
  .preview-empty-sub { font-size: 12px; color: #232323; line-height: 1.6; }

  /* Skeleton */
  .card-skeleton { border: 1px solid #1A1A1A; }
  .sk-top { padding: 20px 20px 14px; border-bottom: 1px solid #1A1A1A; }
  .sk-mid { padding: 16px 20px; border-bottom: 1px solid #1A1A1A; }
  .sk-bot { padding: 14px 20px; display: flex; gap: 10px; align-items: center; }
  .sk-tags { display: flex; gap: 6px; margin-top: 12px; }
  @keyframes shimmer { 0%,100%{opacity:0.3} 50%{opacity:0.6} }
  .sk { background: #1A1A1A; animation: shimmer 1.5s infinite; }
  .sk-title { height: 20px; width: 55%; margin-bottom: 8px; }
  .sk-meta { height: 12px; width: 35%; }
  .sk-line { height: 13px; width: 100%; margin-bottom: 8px; }
  .sk-short { width: 60%; }
  .sk-tag { height: 26px; width: 80px; }
  .sk-avatar { width: 28px; height: 28px; flex-shrink: 0; }

  /* Dinner Card */
  .dcard { border: 1px solid #232323; background: #0E0E0E; }
  .dcard-top { padding: 20px 20px 14px; border-bottom: 1px solid #232323; }
  .dcard-rest { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 400; color: #F0EAE0; margin-bottom: 4px; }
  .dcard-meta { font-size: 11px; color: #6A6560; display: flex; gap: 10px; }
  .dcard-dot { color: #3A3530; }
  .dcard-mid { padding: 16px 20px; border-bottom: 1px solid #232323; }
  .dcard-summary { font-size: 13px; color: #6A6560; line-height: 1.75; margin-bottom: 14px; font-weight: 300; }
  .dcard-match-label { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: #3A3530; margin-bottom: 8px; }
  .dcard-tags { display: flex; flex-wrap: wrap; gap: 6px; }
  .dcard-tag { font-size: 11px; padding: 3px 10px; border: 1px solid #232323; color: #6A6560; }
  .dcard-bot { padding: 12px 20px; display: flex; align-items: center; gap: 10px; border-bottom: 1px solid #1A1A1A; }
  .dcard-av { width: 28px; height: 28px; background: #1A1A1A; border: 1px solid #232323; display: grid; place-items: center; color: #6A6560; }
  .dcard-hname { font-size: 11px; color: #F0EAE0; }
  .dcard-attrs { font-size: 10px; color: #3A3530; margin-top: 2px; font-family: monospace; }
  .dcard-seat { margin-left: auto; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: #6B8F72; border: 1px solid #6B8F72; padding: 2px 8px; opacity: 0.75; }
  .dcard-note { padding: 14px 20px; font-size: 11px; color: #3A3530; line-height: 1.6; font-style: italic; }
`;
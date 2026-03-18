"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function FeedPage() {
  const router = useRouter();
  const [dinners, setDinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/dinners")
      .then((r) => r.json())
      .then((data) => {
        setDinners(data.dinners || []);
        setLoading(false);
      })
      .catch((e) => {
        setError(e.message);
        setLoading(false);
      });
  }, []);

  const tags = (dinner) => {
    if (!dinner.card_good_match) return [];
    return Array.isArray(dinner.card_good_match)
      ? dinner.card_good_match
      : dinner.card_good_match.split("|").map((s) => s.trim());
  };

  return (
    <>
      <style>{css}</style>
      <main className="feed-page">

        <div className="feed-header">
          <div>
            <div className="feed-kicker">San Francisco</div>
            <h1 className="feed-title">This week's dinners</h1>
            <p className="feed-sub">
              {loading ? "Loading..." : `${dinners.length} seat${dinners.length !== 1 ? "s" : ""} available`}
            </p>
          </div>
          <button className="btn-host" onClick={() => router.push("/host")}>
            + Host a dinner
          </button>
        </div>

        <div className="feed-rule" />

        {error && (
          <div className="feed-error">Failed to load dinners: {error}</div>
        )}

        {!loading && dinners.length === 0 && (
          <div className="feed-empty">
            <div className="feed-empty-title">No dinners this week yet.</div>
            <div className="feed-empty-sub">
              Be the first to host one.
            </div>
            <button className="btn-host" style={{marginTop: 24}} onClick={() => router.push("/host")}>
              + Host a dinner
            </button>
          </div>
        )}

        <div className="feed-list">
          {dinners.map((dinner) => (
            <div
              key={dinner.id}
              className="feed-card"
              onClick={() => router.push(`/dinners/${dinner.id}`)}
            >
              <div className="fc-left">
                <div className="fc-date">
                  {dinner.date_text || "Date TBD"}
                </div>
                <div className="fc-rest">
                  {dinner.card_title?.split("—")[0]?.trim() || dinner.restaurant}
                </div>
                <div className="fc-summary">
                  {dinner.card_summary || "A curated dinner experience."}
                </div>
                <div className="fc-footer">
                  <span className="fc-price">{dinner.price_range}</span>
                  {tags(dinner).slice(0, 2).map((t, i) => (
                    <span key={i} className="fc-tag">{t}</span>
                  ))}
                </div>
              </div>
              <div className="fc-right">
                <div className="fc-seat">
                  {dinner.seats_open} seat
                </div>
                <div className="fc-arrow">→</div>
              </div>
            </div>
          ))}
        </div>

      </main>
    </>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #080808; color: #F0EAE0; font-family: 'DM Sans', sans-serif; font-weight: 300; }

  .feed-page { max-width: 860px; margin: 0 auto; padding: 64px 40px 80px; }

  .feed-header { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 32px; }
  .feed-kicker { font-size: 10px; letter-spacing: 0.24em; text-transform: uppercase; color: #8A6E44; margin-bottom: 10px; }
  .feed-title { font-family: 'Cormorant Garamond', serif; font-size: 40px; font-weight: 300; color: #F0EAE0; line-height: 1.1; }
  .feed-sub { font-size: 12px; color: #6A6560; margin-top: 6px; letter-spacing: 0.03em; }

  .btn-host { padding: 10px 22px; background: transparent; border: 1px solid #2E2E2E; color: #6A6560; font-family: 'DM Sans', sans-serif; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; }
  .btn-host:hover { color: #F0EAE0; border-color: #6A6560; }

  .feed-rule { height: 1px; background: #232323; margin-bottom: 2px; }

  .feed-error { font-size: 12px; color: #8F4A42; padding: 16px; border: 1px solid #8F4A42; margin-bottom: 16px; }

  .feed-empty { padding: 80px 0; text-align: center; }
  .feed-empty-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 300; color: #3A3530; }
  .feed-empty-sub { font-size: 13px; color: #3A3530; margin-top: 8px; }

  .feed-list { display: flex; flex-direction: column; gap: 2px; }

  .feed-card {
    display: grid; grid-template-columns: 1fr auto;
    gap: 24px; align-items: center;
    padding: 28px 24px;
    background: #0E0E0E; border: 1px solid #232323;
    cursor: pointer; transition: background 0.15s, border-color 0.15s;
  }
  .feed-card:hover { background: #141414; border-color: #2E2E2E; }

  .fc-date { font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #8A6E44; margin-bottom: 10px; }
  .fc-rest { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 400; color: #F0EAE0; margin-bottom: 8px; }
  .fc-summary { font-size: 13px; color: #6A6560; line-height: 1.7; margin-bottom: 14px; font-weight: 300; }
  .fc-footer { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
  .fc-price { font-size: 11px; color: #3A3530; }
  .fc-tag { font-size: 11px; padding: 3px 9px; border: 1px solid #232323; color: #6A6560; }

  .fc-right { display: flex; flex-direction: column; align-items: flex-end; gap: 12px; }
  .fc-seat { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: #6B8F72; border: 1px solid #6B8F72; padding: 3px 10px; opacity: 0.75; white-space: nowrap; }
  .fc-arrow { font-size: 16px; color: #3A3530; transition: color 0.15s; }
  .feed-card:hover .fc-arrow { color: #6A6560; }
`;
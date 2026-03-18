export default function DinnerCard({ dinner, loading = false }) {
  const tags = dinner?.card_good_match
    ? (Array.isArray(dinner.card_good_match)
        ? dinner.card_good_match
        : dinner.card_good_match.split("|").map((s) => s.trim()))
    : [];

  if (loading) {
    return (
      <div className="dcard dcard--loading">
        <div className="dcard-top">
          <div className="skeleton skeleton--title" />
          <div className="skeleton skeleton--meta" />
        </div>
        <div className="dcard-mid">
          <div className="skeleton skeleton--line" />
          <div className="skeleton skeleton--line skeleton--short" />
          <div style={{ marginTop: 14, display: "flex", gap: 6 }}>
            <div className="skeleton skeleton--tag" />
            <div className="skeleton skeleton--tag" />
            <div className="skeleton skeleton--tag" />
          </div>
        </div>
        <div className="dcard-bot">
          <div className="skeleton skeleton--avatar" />
          <div style={{ flex: 1 }}>
            <div className="skeleton skeleton--line skeleton--short" />
          </div>
        </div>
        <style>{skeletonCSS}</style>
      </div>
    );
  }

  if (!dinner) return null;

  return (
    <div className="dcard">
      <div className="dcard-top">
        <div className="dcard-rest">
          {dinner.card_title?.split("—")[0]?.trim() || dinner.restaurant}
        </div>
        <div className="dcard-meta">
          <span>
            {dinner.card_title?.split("—")[1]?.trim() ||
              `${dinner.date} · ${dinner.time}`}
          </span>
          <span className="dcard-dot">·</span>
          <span>{dinner.price_range}</span>
        </div>
      </div>

      <div className="dcard-mid">
        <p className="dcard-summary">{dinner.card_summary}</p>
        <div className="dcard-match-label">Good match if you</div>
        <div className="dcard-tags">
          {tags.map((t, i) => (
            <span key={i} className="dcard-tag">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="dcard-bot">
        <div className="dcard-av">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
          </svg>
        </div>
        <div>
          <div className="dcard-hname">
            Hosted by {dinner.host_name || "you"}
          </div>
          {dinner.dining_style && (
            <div className="dcard-attrs">
              {dinner.dining_style} · {dinner.social_energy}
            </div>
          )}
        </div>
        <div className="dcard-seat">
          {dinner.seats_open || 1} seat
        </div>
      </div>

      <style>{cardCSS}</style>
    </div>
  );
}

const cardCSS = `
  .dcard { border: 1px solid #232323; background: #0E0E0E; }
  .dcard-top { padding: 20px 20px 14px; border-bottom: 1px solid #232323; }
  .dcard-rest { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 400; color: #F0EAE0; margin-bottom: 4px; }
  .dcard-meta { font-size: 11px; color: #6A6560; display: flex; gap: 10px; }
  .dcard-dot { color: #3A3530; }
  .dcard-mid { padding: 14px 20px; border-bottom: 1px solid #232323; }
  .dcard-summary { font-size: 13px; color: #6A6560; line-height: 1.75; margin-bottom: 12px; font-weight: 300; }
  .dcard-match-label { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: #3A3530; margin-bottom: 8px; }
  .dcard-tags { display: flex; flex-wrap: wrap; gap: 5px; }
  .dcard-tag { font-size: 11px; padding: 3px 9px; border: 1px solid #232323; color: #6A6560; }
  .dcard-bot { padding: 12px 20px; display: flex; align-items: center; gap: 10px; }
  .dcard-av { width: 28px; height: 28px; background: #1A1A1A; border: 1px solid #232323; display: grid; place-items: center; color: #6A6560; }
  .dcard-hname { font-size: 11px; color: #F0EAE0; }
  .dcard-attrs { font-size: 10px; color: #3A3530; margin-top: 2px; font-family: monospace; }
  .dcard-seat { margin-left: auto; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: #6B8F72; border: 1px solid #6B8F72; padding: 2px 8px; opacity: 0.75; }
`;

const skeletonCSS = `
  @keyframes shimmer { 0% { opacity: 0.4; } 50% { opacity: 0.7; } 100% { opacity: 0.4; } }
  .skeleton { background: #1A1A1A; animation: shimmer 1.5s infinite; }
  .skeleton--title { height: 20px; width: 60%; margin-bottom: 8px; }
  .skeleton--meta { height: 12px; width: 40%; }
  .skeleton--line { height: 13px; width: 100%; margin-bottom: 8px; }
  .skeleton--short { width: 65%; }
  .skeleton--tag { height: 24px; width: 80px; }
  .skeleton--avatar { width: 28px; height: 28px; flex-shrink: 0; }
`;
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import DinnerCard from "@/components/dinner/DinnerCard";

export default function HostPage() {
  const router = useRouter();

  const [fields, setFields] = useState({
    restaurant: "",
    date: "",
    time: "",
    price_range: "$$$",
    seats_open: 1,
    host_note_raw: "",
  });

  const [cardPreview, setCardPreview] = useState(null);
  const [cardLoading, setCardLoading] = useState(false);
  const [launchMode, setLaunchMode] = useState("publish"); // "check" | "publish"
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const set = (k, v) => setFields((f) => ({ ...f, [k]: v }));

  // Generate card preview when host note loses focus
  const generateCard = async () => {
    const note = fields.host_note_raw;
    if (!note.trim() || !fields.restaurant.trim()) return;

    setCardLoading(true);
    setCardPreview(null);

    try {
        const res = await fetch("/api/test-dinner-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, host_note_raw: note }),
        });
      const data = await res.json();
      if (data.success) {
        setCardPreview({ ...data.result, ...fields });
      }
    } catch (_) {
      // Silent fail — card preview is enhancement, not required
    } finally {
      setCardLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!fields.restaurant || !fields.date || !fields.time || !fields.host_note_raw) {
      setError("Please fill in restaurant, date, time, and your note.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/dinners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...fields, launch_mode: launchMode, card_data: cardPreview }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Something went wrong");

      router.push("/feed");
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = fields.restaurant && fields.date && fields.time && fields.host_note_raw;

  return (
    <>
      <style>{css}</style>
      <main className="host-page">
        <div className="host-form">

          <div className="form-header">
            <div className="form-kicker">New listing</div>
            <h1 className="form-title">Post a dinner</h1>
            <p className="form-desc">
              Tell us about your reservation. We'll turn your note into a
              Dinner Card that helps the right person find you.
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
                placeholder="e.g. Saturday, March 21"
              />
            </div>
            <div className="field">
              <label className="label">Time</label>
              <input
                className="input"
                value={fields.time}
                onChange={(e) => set("time", e.target.value)}
                placeholder="e.g. 7:00 PM"
              />
            </div>
          </div>

          <div className="field-row">
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
              <label className="label">Seats open</label>
              <input
                className="input"
                value={fields.seats_open}
                readOnly
                style={{ color: "#3A3530" }}
              />
            </div>
          </div>

          <div className="field">
            <label className="label">Why this dinner?</label>
            <textarea
              className="textarea"
              value={fields.host_note_raw}
              onChange={(e) => set("host_note_raw", e.target.value)}
            //   onBlur={(e) => handleNoteBlur(e.target.value)}
              placeholder="Write freely — why did you book this place? What kind of night do you have in mind? We'll use this to create your Dinner Card."
            />
            <div className="field-hint" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <span>Tab out or click generate to preview your card.</span>
                <button
                    onClick={generateCard}
                    disabled={!fields.host_note_raw.trim() || !fields.restaurant.trim() || cardLoading}
                    style={{fontSize:'10px', letterSpacing:'0.14em', textTransform:'uppercase', background:'none', border:'1px solid #232323', color:'#6A6560', padding:'5px 12px', cursor:'pointer', fontFamily:'DM Sans, sans-serif'}}
                >
                    {cardLoading ? 'Generating...' : 'Generate card →'}
                </button>
            </div>
          </div>

          {/* Interest check toggle */}
          <div className="ic-block">
            <div className="ic-title">How do you want to launch?</div>
            <div className="ic-desc">
              Use the interest check to gauge demand before going public — or
              publish immediately.
            </div>
            <div className="ic-row">
              <button
                className={`ic-opt ${launchMode === "check" ? "on" : ""}`}
                onClick={() => setLaunchMode("check")}
              >
                Interest check first
              </button>
              <button
                className={`ic-opt ${launchMode === "publish" ? "on" : ""}`}
                onClick={() => setLaunchMode("publish")}
              >
                Publish immediately
              </button>
            </div>
          </div>

          {/* Reassurance copy */}
          <div className="reassurance">
            Most dinners fill within a day. Start by sharing why you're
            excited about this one.
          </div>

          {error && <div className="error">{error}</div>}

          <button
            className="btn-submit"
            onClick={handleSubmit}
            disabled={submitting || !canSubmit}
          >
            {submitting
              ? "Posting..."
              : launchMode === "check"
              ? "Start interest check"
              : "Publish dinner"}
          </button>
        </div>

        {/* Card preview */}
        <div className="host-preview">
          <div className="preview-label">AI-generated Dinner Card</div>
          {cardLoading || cardPreview ? (
            <DinnerCard dinner={cardPreview} loading={cardLoading} />
          ) : (
            <div className="preview-empty">
              <div className="preview-empty-title">Your card will appear here</div>
              <div className="preview-empty-sub">
                Fill in the restaurant and finish your note — we'll generate
                the card automatically.
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

  .host-page {
    display: grid;
    grid-template-columns: 1fr 1fr;
    min-height: 100vh;
    max-width: 1200px;
    margin: 0 auto;
    gap: 0;
  }

  .host-form {
    padding: 64px 48px;
    border-right: 1px solid #232323;
  }

  .host-preview {
    padding: 64px 48px;
    position: sticky;
    top: 0;
    height: 100vh;
    overflow-y: auto;
  }

  /* Header */
  .form-header { margin-bottom: 40px; }
  .form-kicker { font-size: 10px; letter-spacing: 0.24em; text-transform: uppercase; color: #8A6E44; margin-bottom: 10px; }
  .form-title { font-family: 'Cormorant Garamond', serif; font-size: 40px; font-weight: 300; color: #F0EAE0; line-height: 1.1; margin-bottom: 10px; }
  .form-desc { font-size: 13px; color: #6A6560; line-height: 1.7; font-weight: 300; }

  /* Fields */
  .field { margin-bottom: 20px; }
  .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
  .field-row .field { margin-bottom: 0; }
  .label { font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: #6A6560; margin-bottom: 7px; display: block; }
  .field-hint { font-size: 11px; color: #3A3530; margin-top: 6px; }

  .input, .textarea {
    width: 100%; background: #0E0E0E; border: 1px solid #232323;
    color: #F0EAE0; font-family: 'DM Sans', sans-serif; font-weight: 300;
    font-size: 14px; padding: 11px 14px; outline: none;
    transition: border-color 0.2s;
  }
  .input:focus, .textarea:focus { border-color: #2E2E2E; }
  .input::placeholder, .textarea::placeholder { color: #3A3530; }
  .textarea { resize: vertical; min-height: 100px; line-height: 1.65; }

  /* Interest check */
  .ic-block { border: 1px solid #232323; padding: 18px; margin-bottom: 18px; background: #0E0E0E; }
  .ic-title { font-size: 12px; font-weight: 400; color: #F0EAE0; margin-bottom: 4px; }
  .ic-desc { font-size: 12px; color: #6A6560; margin-bottom: 14px; line-height: 1.6; }
  .ic-row { display: flex; gap: 8px; }
  .ic-opt { flex: 1; padding: 9px; border: 1px solid #232323; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; text-align: center; cursor: pointer; color: #6A6560; background: none; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
  .ic-opt.on { border-color: #8A6E44; color: #C9A96E; }

  /* Reassurance */
  .reassurance { font-size: 12px; font-style: italic; color: #6A6560; border-left: 1px solid #6B8F72; padding-left: 14px; margin-bottom: 20px; line-height: 1.7; }

  /* Error */
  .error { font-size: 12px; color: #8F4A42; border: 1px solid #8F4A42; padding: 10px 14px; margin-bottom: 16px; }

  /* Submit */
  .btn-submit { width: 100%; padding: 13px; background: #F0EAE0; color: #080808; border: none; font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; cursor: pointer; transition: background 0.2s; }
  .btn-submit:hover:not(:disabled) { background: #FAFAF8; }
  .btn-submit:disabled { background: #1A1A1A; color: #3A3530; cursor: default; }

  /* Preview */
  .preview-label { font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: #3A3530; margin-bottom: 14px; display: flex; align-items: center; gap: 10px; }
  .preview-label::after { content: ''; flex: 1; height: 1px; background: #232323; }

  .preview-empty { border: 1px solid #232323; padding: 48px 32px; text-align: center; }
  .preview-empty-title { font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 300; color: #3A3530; margin-bottom: 8px; }
  .preview-empty-sub { font-size: 12px; color: #3A3530; line-height: 1.6; }
`;
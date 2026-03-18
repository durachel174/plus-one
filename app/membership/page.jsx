"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CUISINES = [
  "Japanese", "French", "Italian", "Chinese", "Korean",
  "Mexican", "Mediterranean", "Southeast Asian", "American", "Other"
];

export default function MembershipPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    goto_spots: ["", "", ""],
    wishlist: ["", "", ""],
    cuisines: [],
    price_range: "",
    dining_style: "",
    intent: [],
    weekend: "",
    note: "",
  });

  const setGoTo = (i, v) => {
    const updated = [...form.goto_spots];
    updated[i] = v;
    setForm({ ...form, goto_spots: updated });
  };

  const setWishlist = (i, v) => {
    const updated = [...form.wishlist];
    updated[i] = v;
    setForm({ ...form, wishlist: updated });
  };

  const toggleCuisine = (c) => {
    setForm({
      ...form,
      cuisines: form.cuisines.includes(c)
        ? form.cuisines.filter((x) => x !== c)
        : [...form.cuisines, c],
    });
  };

  const toggleIntent = (v) => {
    setForm({
      ...form,
      intent: form.intent.includes(v)
        ? form.intent.filter((x) => x !== v)
        : [...form.intent, v],
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/membership", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSubmitted(true);
    } catch (_) {
      setSubmitted(true); // still show confirmation — don't penalize network issues
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <>
        <style>{css}</style>
        <main className="membership-page">
          <div className="submitted">
            <div className="submitted-title">Thanks — we'll take a look.</div>
            <p className="submitted-sub">
              We review requests to keep the club intentional.<br />
              You'll hear back soon.
            </p>
            <button className="btn-ghost" onClick={() => router.push("/")}>
              Back to Plus One
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <main className="membership-page">
        <div className="membership-inner">

          {/* Intro */}
          <div className="intro">
            <div className="intro-kicker">Membership</div>
            <h1 className="intro-title">Request membership</h1>
            <p className="intro-sub">
              We ask a few questions to understand your taste.<br />
              There's no right answer — just what feels like you.
            </p>
          </div>

          {/* Section 1 — Taste */}
          <div className="section-label">Taste</div>

          <div className="question">
            <div className="q-title">Your go-to spots</div>
            <div className="q-sub">Three restaurants you keep going back to.</div>
            <div className="q-inputs">
              {form.goto_spots.map((v, i) => (
                <input
                  key={i}
                  className="input"
                  value={v}
                  onChange={(e) => setGoTo(i, e.target.value)}
                  placeholder={`Restaurant ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="question">
            <div className="q-title">Your wishlist</div>
            <div className="q-sub">Three places you've been wanting to try.</div>
            <div className="q-inputs">
              {form.wishlist.map((v, i) => (
                <input
                  key={i}
                  className="input"
                  value={v}
                  onChange={(e) => setWishlist(i, e.target.value)}
                  placeholder={`Restaurant ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="question">
            <div className="q-title">Cuisine preferences</div>
            <div className="q-sub">What you naturally choose when deciding where to eat.</div>
            <div className="cuisine-grid">
              {CUISINES.map((c) => (
                <button
                  key={c}
                  className={`cuisine-opt ${form.cuisines.includes(c) ? "selected" : ""}`}
                  onClick={() => toggleCuisine(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="question">
            <div className="q-title">Typical dinner range</div>
            <div className="q-sub">On a normal night out, where do you usually land?</div>
            <div className="single-opts">
              {[
                { v: "$", l: "$ — casual, quick" },
                { v: "$$", l: "$$ — relaxed sit-down" },
                { v: "$$$", l: "$$$ — considered choice" },
                { v: "$$$$", l: "$$$$ — special occasion" },
              ].map(({ v, l }) => (
                <button
                  key={v}
                  className={`single-opt ${form.price_range === v ? "selected" : ""}`}
                  onClick={() => setForm({ ...form, price_range: v })}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Section 2 — How you dine */}
          <div className="section-label">How you like to dine</div>

          <div className="question">
            <div className="q-title">What kind of dinner feels right to you?</div>
            <div className="single-opts">
              {[
                "Quiet and thoughtful",
                "Lively and conversational",
                "Somewhere in between",
              ].map((v) => (
                <button
                  key={v}
                  className={`single-opt ${form.dining_style === v ? "selected" : ""}`}
                  onClick={() => setForm({ ...form, dining_style: v })}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="question">
            <div className="q-title">What brings you here?</div>
            <div className="q-sub">Select all that apply.</div>
            <div className="single-opts">
              {[
                "I care about good food",
                "I'd rather not dine alone",
                "I like meeting people with similar taste",
                "I already make reservations and want to share them",
                "Just curious",
              ].map((v) => (
                <button
                  key={v}
                  className={`single-opt ${form.intent.includes(v) ? "selected" : ""}`}
                  onClick={() => toggleIntent(v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {/* Section 3 — A bit of you */}
          <div className="section-label">A bit of you</div>

          <div className="question">
            <div className="q-title">A good weekend looks like</div>
            <div className="single-opts">
              {[
                "Coffee and a long walk",
                "Trying a new restaurant",
                "Wine bar or small gathering",
                "Staying in and cooking",
                "Something spontaneous",
              ].map((v) => (
                <button
                  key={v}
                  className={`single-opt ${form.weekend === v ? "selected" : ""}`}
                  onClick={() => setForm({ ...form, weekend: v })}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <div className="question">
            <div className="q-title">Anything else?</div>
            <div className="q-sub">
              Not required — just if there's something that shapes how you like to spend a night out.
            </div>
            <textarea
              className="textarea"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Optional."
            />
          </div>

          {/* Submit */}
          <div className="submit-section">
            <button
              className="btn-submit"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Submit request"}
            </button>
            <p className="submit-note">
              Membership is free. We review requests to keep dinners feeling right.
            </p>
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

  .membership-page { min-height: 100vh; padding: 80px 40px; }
  .membership-inner { max-width: 560px; margin: 0 auto; }

  /* Intro */
  .intro { margin-bottom: 80px; }
  .intro-kicker { font-size: 10px; letter-spacing: 0.24em; text-transform: uppercase; color: #8A6E44; margin-bottom: 14px; }
  .intro-title { font-family: 'Cormorant Garamond', serif; font-size: 44px; font-weight: 300; color: #F0EAE0; line-height: 1.1; margin-bottom: 16px; }
  .intro-sub { font-size: 14px; color: #6A6560; line-height: 1.8; font-weight: 300; }

  /* Section labels */
  .section-label {
    font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase;
    color: #3A3530; margin-bottom: 56px; margin-top: 80px;
    padding-bottom: 12px; border-bottom: 1px solid #1A1A1A;
  }

  /* Questions */
  .question { margin-bottom: 72px; }
  .q-title { font-family: 'Cormorant Garamond', serif; font-size: 24px; font-weight: 400; color: #F0EAE0; margin-bottom: 8px; line-height: 1.3; }
  .q-sub { font-size: 13px; color: #6A6560; margin-bottom: 24px; line-height: 1.6; font-weight: 300; }
  .q-inputs { display: flex; flex-direction: column; gap: 10px; }

  /* Inputs */
  .input, .textarea {
    width: 100%; background: transparent; border: none;
    border-bottom: 1px solid #232323;
    color: #F0EAE0; font-family: 'DM Sans', sans-serif; font-weight: 300;
    font-size: 14px; padding: 10px 0; outline: none;
    transition: border-color 0.2s;
  }
  .input:focus, .textarea:focus { border-bottom-color: #6A6560; }
  .input::placeholder, .textarea::placeholder { color: #2E2E2E; }
  .textarea { resize: none; min-height: 72px; line-height: 1.65; }

  /* Cuisine grid */
  .cuisine-grid { display: flex; flex-wrap: wrap; gap: 8px; }
  .cuisine-opt {
    padding: 8px 16px; border: 1px solid #232323; background: none;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 300;
    color: #6A6560; cursor: pointer; transition: all 0.15s;
  }
  .cuisine-opt:hover { border-color: #2E2E2E; color: #F0EAE0; }
  .cuisine-opt.selected { border-color: #C9A96E; color: #C9A96E; }

  /* Single select options */
  .single-opts { display: flex; flex-direction: column; gap: 8px; }
  .single-opt {
    padding: 13px 16px; border: 1px solid #1A1A1A; background: none;
    font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 300;
    color: #6A6560; cursor: pointer; transition: all 0.15s;
    text-align: left;
  }
  .single-opt:hover { border-color: #2E2E2E; color: #F0EAE0; }
  .single-opt.selected { border-color: #C9A96E; color: #C9A96E; background: #C9A96E08; }

  /* Submit */
  .submit-section { margin-top: 80px; padding-top: 40px; border-top: 1px solid #1A1A1A; }
  .btn-submit {
    width: 100%; padding: 14px; background: #F0EAE0; color: #080808;
    border: none; font-family: 'DM Sans', sans-serif; font-weight: 500;
    font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase;
    cursor: pointer; transition: background 0.2s; margin-bottom: 16px;
  }
  .btn-submit:hover:not(:disabled) { background: #FAFAF8; }
  .btn-submit:disabled { background: #1A1A1A; color: #3A3530; cursor: default; }
  .submit-note { font-size: 12px; color: #3A3530; line-height: 1.6; text-align: center; }

  /* Submitted */
  .submitted { max-width: 400px; margin: 0 auto; padding-top: 120px; }
  .submitted-title { font-family: 'Cormorant Garamond', serif; font-size: 36px; font-weight: 300; color: #F0EAE0; margin-bottom: 16px; }
  .submitted-sub { font-size: 14px; color: #6A6560; line-height: 1.8; margin-bottom: 40px; font-weight: 300; }
  .btn-ghost { background: none; border: none; font-family: 'DM Sans', sans-serif; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: #6A6560; cursor: pointer; transition: color 0.2s; padding: 0; }
  .btn-ghost:hover { color: #F0EAE0; }
`;
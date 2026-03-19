"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import DinnerCard from "@/components/dinner/DinnerCard";

export default function DinnerPage() {
  const router = useRouter();
  const { id } = useParams();

  const [dinner, setDinner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0); // 0: review, 1: message, 2: confirmed
  const [message, setMessage] = useState("");
  const [answer, setAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`/api/dinners/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setDinner(data.dinner);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleRequest = async () => {
    if (!message.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dinner_id: id,
          message,
          guest_answer: answer.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setStep(2);
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <>
        <style>{css}</style>
        <main className="detail-page">
          <div className="loading">Loading...</div>
        </main>
      </>
    );
  }

  if (!dinner) {
    return (
      <>
        <style>{css}</style>
        <main className="detail-page">
          <div className="loading">Dinner not found.</div>
        </main>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <main className="detail-page">

        {/* Back */}
        <button className="btn-back" onClick={() => router.push("/feed")}>
          ← Back to feed
        </button>

        {/* Step indicator */}
        <div className="steps">
          {["Review", "Request", "Confirmed"].map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : "none" }}>
              <div className={`step-dot ${i < step ? "done" : i === step ? "active" : ""}`}>
                {i < step ? "✓" : i + 1}
              </div>
              {i < 2 && <div className={`step-line ${i < step ? "done" : ""}`} />}
            </div>
          ))}
        </div>

        {/* Step 0 — Review */}
        {step === 0 && (
          <div className="step-content">
            <div className="step-title">Review this dinner</div>
            <p className="step-sub">
              Make sure this feels like the right fit before requesting a seat.
            </p>
            <DinnerCard dinner={dinner} />
            <div className="act-row">
              <button className="btn-main" onClick={() => setStep(1)}>
                Request this seat →
              </button>
            </div>
          </div>
        )}

        {/* Step 1 — Message */}
        {step === 1 && (
          <div className="step-content">
            <div className="step-title">Before you join</div>
            <p className="step-sub">
              Your message goes to the host. Be specific — mention what draws
              you to this particular dinner.
            </p>

            {/* Host question — only shown if one exists */}
            {dinner.host_question && (
              <div className="host-question-block">
                <div className="hq-label">From the host</div>
                <div className="hq-text">{dinner.host_question}</div>
                <textarea
                  className="textarea hq-textarea"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Your answer"
                  rows={2}
                />
              </div>
            )}

            <div className="message-label">Why do you want to join?</div>
            <textarea
              className="textarea"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`e.g. I've been wanting to try ${dinner.restaurant} for a while — I love the kind of dinner where the food is the whole point and conversation comes naturally.`}
            />

            {error && <div className="req-error">{error}</div>}
            <div className="act-row">
              <button className="btn-back-sm" onClick={() => setStep(0)}>
                Back
              </button>
              <button
                className="btn-main"
                onClick={handleRequest}
                disabled={submitting || message.trim().length < 10}
              >
                {submitting ? "Sending..." : "Send request →"}
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Confirmed */}
        {step === 2 && (
          <div className="step-content">
            <div className="conf-box">
              <div className="conf-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold-dim)" strokeWidth="1" strokeLinecap="round">
                  <line x1="12" y1="2" x2="12" y2="6" />
                  <line x1="12" y1="18" x2="12" y2="22" />
                  <line x1="2" y1="12" x2="6" y2="12" />
                  <line x1="18" y1="12" x2="22" y2="12" />
                  <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                  <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                  <line x1="19.07" y1="4.93" x2="16.24" y2="7.76" />
                  <line x1="7.76" y1="16.24" x2="4.93" y2="19.07" />
                </svg>
              </div>
              <div className="conf-title">Request sent</div>
              <p className="conf-sub">
                The host will review your request and respond within 24 hours.
                You'll hear back by email once they decide.
              </p>
              <div className="conf-detail">
                If accepted, you'll receive the host's contact details directly.
                No further steps needed — just show up.
              </div>
            </div>
            <div className="act-row" style={{ marginTop: 24 }}>
              <button className="btn-outline-full" onClick={() => router.push("/feed")}>
                Browse more dinners
              </button>
            </div>
          </div>
        )}

      </main>
    </>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #080808; color: #F0EAE0; font-family: 'DM Sans', sans-serif; font-weight: 300; }

  :root { --gold-dim: #8A6E44; }

  .detail-page { max-width: 600px; margin: 0 auto; padding: 56px 40px 80px; }

  .loading { font-size: 13px; color: #6A6560; padding: 40px 0; }

  .btn-back { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #6A6560; background: none; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; margin-bottom: 40px; display: block; transition: color 0.15s; }
  .btn-back:hover { color: #F0EAE0; }

  /* Steps */
  .steps { display: flex; align-items: center; margin-bottom: 40px; }
  .step-dot { width: 24px; height: 24px; border: 1px solid #232323; display: grid; place-items: center; font-size: 10px; color: #3A3530; transition: all 0.3s; font-family: 'DM Sans', sans-serif; flex-shrink: 0; }
  .step-dot.active { border-color: #F0EAE0; color: #F0EAE0; }
  .step-dot.done { background: #6B8F72; border-color: #6B8F72; color: #080808; font-size: 12px; }
  .step-line { flex: 1; height: 1px; background: #232323; }
  .step-line.done { background: #6B8F7244; }

  /* Step content */
  .step-content { animation: fadeIn 0.25s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

  .step-title { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 300; color: #F0EAE0; margin-bottom: 8px; }
  .step-sub { font-size: 13px; color: #6A6560; line-height: 1.7; margin-bottom: 28px; font-weight: 300; }

  /* Host question block */
  .host-question-block {
    border: 1px solid #232323;
    border-left: 2px solid #2A3D2E;
    padding: 16px;
    margin-bottom: 20px;
    background: #0A0A0A;
  }
  .hq-label {
    font-size: 10px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #6B8F72;
    margin-bottom: 8px;
  }
  .hq-text {
    font-family: 'Cormorant Garamond', serif;
    font-size: 18px;
    font-weight: 300;
    font-style: italic;
    color: #F0EAE0;
    line-height: 1.5;
    margin-bottom: 14px;
  }
  .hq-textarea {
    border-left: none !important;
    margin-bottom: 0 !important;
  }

  /* Message label */
  .message-label {
    font-size: 10px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #6A6560;
    margin-bottom: 7px;
  }

  /* Textarea */
  .textarea { width: 100%; background: #0E0E0E; border: 1px solid #232323; color: #F0EAE0; font-family: 'DM Sans', sans-serif; font-weight: 300; font-size: 14px; padding: 13px 16px; outline: none; resize: vertical; min-height: 120px; line-height: 1.65; transition: border-color 0.2s; margin-bottom: 8px; }
  .textarea:focus { border-color: #2E2E2E; }
  .textarea::placeholder { color: #3A3530; }

  .req-error { font-size: 12px; color: #8F4A42; border: 1px solid #8F4A42; padding: 10px 14px; margin-bottom: 12px; }

  /* Actions */
  .act-row { display: flex; gap: 10px; margin-top: 20px; }
  .btn-main { flex: 1; padding: 13px; background: #F0EAE0; color: #080808; border: none; font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; cursor: pointer; transition: background 0.2s; }
  .btn-main:hover:not(:disabled) { background: #FAFAF8; }
  .btn-main:disabled { background: #1A1A1A; color: #3A3530; cursor: default; }
  .btn-back-sm { padding: 13px 20px; background: none; border: 1px solid #232323; font-family: 'DM Sans', sans-serif; font-weight: 300; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #6A6560; cursor: pointer; transition: all 0.2s; }
  .btn-back-sm:hover { color: #F0EAE0; border-color: #2E2E2E; }
  .btn-outline-full { flex: 1; padding: 13px; background: none; color: #6A6560; border: 1px solid #232323; font-family: 'DM Sans', sans-serif; font-weight: 300; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; }
  .btn-outline-full:hover { color: #F0EAE0; border-color: #2E2E2E; }

  /* Confirmation */
  .conf-box { padding: 48px 32px; border: 1px solid #232323; background: #0E0E0E; text-align: center; }
  .conf-icon { margin-bottom: 20px; opacity: 0.7; display: flex; justify-content: center; }
  .conf-title { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 300; color: #F0EAE0; margin-bottom: 10px; }
  .conf-sub { font-size: 13px; color: #6A6560; line-height: 1.8; font-weight: 300; }
  .conf-detail { margin-top: 20px; padding: 14px 20px; border: 1px solid #232323; font-size: 12px; color: #6A6560; line-height: 1.7; }
`;
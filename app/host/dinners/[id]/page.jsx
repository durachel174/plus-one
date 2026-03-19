"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function DinnerRequestsPage() {
  const router = useRouter();
  const { id } = useParams();

  const [dinner, setDinner] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deciding, setDeciding] = useState(null); // request_id being acted on

  useEffect(() => {
    Promise.all([
      fetch(`/api/dinners/${id}`).then((r) => r.json()),
      fetch(`/api/requests?dinner_id=${id}`).then((r) => r.json()),
    ]).then(([dinnerData, requestData]) => {
      setDinner(dinnerData.dinner);
      setRequests(requestData.requests ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const decide = async (request_id, status) => {
    setDeciding(request_id);
    try {
      const res = await fetch("/api/requests", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ request_id, status }),
      });
      if (res.ok) {
        setRequests((prev) => prev.filter((r) => r.id !== request_id));
      }
    } catch (_) {}
    finally { setDeciding(null); }
  };

  if (loading) return (
    <>
      <style>{css}</style>
      <main className="requests-page"><div className="state-text">Loading...</div></main>
    </>
  );

  return (
    <>
      <style>{css}</style>
      <main className="requests-page">

        <button className="btn-back" onClick={() => router.push("/host/dinners")}>
          ← My dinners
        </button>

        <div className="page-header">
          <div className="page-kicker">Incoming requests</div>
          <h1 className="page-title">{dinner?.restaurant}</h1>
          <div className="page-meta">{dinner?.date_text}</div>
        </div>

        {requests.length === 0 && (
          <div className="empty">
            <div className="empty-title">No pending requests</div>
            <div className="empty-sub">When guests request a seat, they'll appear here.</div>
          </div>
        )}

        <div className="request-list">
          {requests.map((req) => {
            const name = req.profiles?.full_name || "A guest";
            const bio = req.profiles?.bio;
            const isDeciding = deciding === req.id;

            return (
              <div key={req.id} className="request-card">

                {/* Guest identity */}
                <div className="guest-header">
                  <div className="guest-avatar">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="guest-name">{name}</div>
                    {bio && <div className="guest-bio">{bio}</div>}
                  </div>
                </div>

                {/* Host question + guest answer */}
                {dinner?.host_question && req.guest_answer && (
                  <div className="qa-block">
                    <div className="qa-question">{dinner.host_question}</div>
                    <div className="qa-answer">"{req.guest_answer}"</div>
                  </div>
                )}

                {/* Message */}
                <div className="message-block">
                  <div className="message-label">Why they want to join</div>
                  <div className="message-text">{req.message}</div>
                </div>

                {/* Actions */}
                <div className="action-row">
                  <button
                    className="btn-pass"
                    onClick={() => decide(req.id, "passed")}
                    disabled={isDeciding}
                  >
                    Pass
                  </button>
                  <button
                    className="btn-accept"
                    onClick={() => decide(req.id, "accepted")}
                    disabled={isDeciding}
                  >
                    {isDeciding ? "..." : "Accept"}
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </main>
    </>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #080808; color: #F0EAE0; font-family: 'DM Sans', sans-serif; font-weight: 300; }

  .requests-page { max-width: 600px; margin: 0 auto; padding: 96px 40px 80px; }

  .btn-back { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #6A6560; background: none; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif; margin-bottom: 40px; display: block; transition: color 0.15s; padding: 0; }
  .btn-back:hover { color: #F0EAE0; }

  .page-header { margin-bottom: 48px; }
  .page-kicker { font-size: 10px; letter-spacing: 0.24em; text-transform: uppercase; color: #8A6E44; margin-bottom: 10px; }
  .page-title { font-family: 'Cormorant Garamond', serif; font-size: 40px; font-weight: 300; color: #F0EAE0; margin-bottom: 6px; }
  .page-meta { font-size: 13px; color: #6A6560; }

  .state-text { font-size: 13px; color: #6A6560; padding: 40px 0; }

  .empty { padding: 48px 0; }
  .empty-title { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 300; color: #3A3530; margin-bottom: 8px; }
  .empty-sub { font-size: 13px; color: #3A3530; line-height: 1.6; }

  .request-list { display: flex; flex-direction: column; gap: 2px; }

  .request-card {
    border: 1px solid #1A1A1A;
    background: #0A0A0A;
    padding: 28px;
    display: flex;
    flex-direction: column;
    gap: 24px;
    animation: fadeIn 0.2s ease;
  }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }

  /* Guest */
  .guest-header { display: flex; gap: 14px; align-items: flex-start; }
  .guest-avatar {
    width: 36px; height: 36px; background: #1A1A1A; border: 1px solid #232323;
    display: grid; place-items: center; font-size: 14px; color: #6A6560;
    font-family: 'Cormorant Garamond', serif; flex-shrink: 0;
  }
  .guest-name { font-size: 14px; color: #F0EAE0; font-weight: 400; margin-bottom: 5px; }
  .guest-bio { font-size: 12px; color: #6A6560; line-height: 1.65; font-style: italic; }

  /* Q&A */
  .qa-block {
    border-left: 2px solid #2A3D2E;
    padding: 12px 16px;
    background: #080808;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .qa-question {
    font-size: 11px; letter-spacing: 0.08em; color: #6B8F72;
    text-transform: uppercase; letter-spacing: 0.14em;
  }
  .qa-answer {
    font-family: 'Cormorant Garamond', serif;
    font-size: 20px; font-weight: 300; font-style: italic;
    color: #F0EAE0; line-height: 1.5;
  }

  /* Message */
  .message-block { display: flex; flex-direction: column; gap: 7px; }
  .message-label { font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: #3A3530; }
  .message-text { font-size: 13px; color: #6A6560; line-height: 1.75; }

  /* Actions */
  .action-row { display: flex; gap: 8px; padding-top: 4px; }
  .btn-pass {
    padding: 10px 24px; border: 1px solid #232323; background: none;
    color: #6A6560; font-family: 'DM Sans', sans-serif; font-size: 11px;
    letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer;
    transition: all 0.15s;
  }
  .btn-pass:hover:not(:disabled) { border-color: #2E2E2E; color: #F0EAE0; }
  .btn-pass:disabled { opacity: 0.4; cursor: default; }

  .btn-accept {
    flex: 1; padding: 10px; background: #F0EAE0; color: #080808;
    border: none; font-family: 'DM Sans', sans-serif; font-weight: 500;
    font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase;
    cursor: pointer; transition: background 0.2s;
  }
  .btn-accept:hover:not(:disabled) { background: #FAFAF8; }
  .btn-accept:disabled { background: #1A1A1A; color: #3A3530; cursor: default; }
`;
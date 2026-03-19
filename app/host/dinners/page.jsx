"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MyDinnersPage() {
  const router = useRouter();
  const [dinners, setDinners] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/dinners/mine").then((r) => r.json()),
      fetch("/api/requests/accepted").then((r) => r.json()),
    ]).then(([hostData, guestData]) => {
      setDinners(hostData.dinners ?? []);
      setUpcoming(guestData.upcoming ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <>
      <style>{css}</style>
      <main className="my-dinners-page">
        <div className="page-header">
          <div className="page-kicker">My dinners</div>
          <h1 className="page-title">Your table</h1>
        </div>

        {loading && <div className="state-text">Loading...</div>}

        {!loading && (
          <>
            {/* Upcoming — accepted as guest */}
            <div className="section">
              <div className="section-label">Upcoming</div>
              {upcoming.length === 0 ? (
                <div className="section-empty">
                  No upcoming dinners.{" "}
                  <button className="inline-link" onClick={() => router.push("/feed")}>
                    Browse this week →
                  </button>
                </div>
              ) : (
                <div className="dinner-list">
                  {upcoming.map((d) => (
                    <div key={d.request_id} className="dinner-row no-click">
                      <div className="dinner-row-main">
                        <div className="dinner-row-name">{d.restaurant}</div>
                        <div className="dinner-row-meta">{d.date_text}</div>
                      </div>
                      <div className="dinner-row-right">
                        {d.host_name && (
                          <div className="other-person">with {d.host_name}</div>
                        )}
                        <div className="status-tag status-accepted">Accepted</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hosting */}
            <div className="section">
              <div className="section-label">Hosting</div>
              {dinners.length === 0 ? (
                <div className="section-empty">
                  No dinners posted yet.{" "}
                  <button className="inline-link" onClick={() => router.push("/host")}>
                    Post your first one →
                  </button>
                </div>
              ) : (
                <div className="dinner-list">
                  {dinners.map((d) => (
                    <div
                      key={d.id}
                      className="dinner-row"
                      onClick={() => router.push(`/host/dinners/${d.id}`)}
                    >
                      <div className="dinner-row-main">
                        <div className="dinner-row-name">{d.restaurant}</div>
                        <div className="dinner-row-meta">{d.date_text}</div>
                      </div>
                      <div className="dinner-row-right">
                        {d.pending_count > 0 && (
                          <div className="request-badge">{d.pending_count}</div>
                        )}
                        <div className={`status-tag status-${d.status}`}>
                          {d.status === "interest_check" ? "Interest check" : "Open"}
                        </div>
                        <div className="row-arrow">→</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #080808; color: #F0EAE0; font-family: 'DM Sans', sans-serif; font-weight: 300; }

  .my-dinners-page { max-width: 640px; margin: 0 auto; padding: 96px 40px 80px; }

  .page-header { margin-bottom: 56px; }
  .page-kicker { font-size: 10px; letter-spacing: 0.24em; text-transform: uppercase; color: #8A6E44; margin-bottom: 10px; }
  .page-title { font-family: 'Cormorant Garamond', serif; font-size: 40px; font-weight: 300; color: #F0EAE0; }

  .section { margin-bottom: 52px; }
  .section-label {
    font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase;
    color: #3A3530; margin-bottom: 16px; padding-bottom: 12px;
    border-bottom: 1px solid #1A1A1A;
  }

  .section-empty { font-size: 13px; color: #6A6560; line-height: 1.7; padding: 4px 0; }
  .state-text { font-size: 13px; color: #6A6560; }
  .inline-link { background: none; border: none; color: #C9A96E; font-size: 13px; cursor: pointer; font-family: inherit; padding: 0; text-decoration: underline; text-underline-offset: 3px; }

  .dinner-list { display: flex; flex-direction: column; }

  .dinner-row {
    display: flex; align-items: center; justify-content: space-between;
    padding: 18px 0; border-bottom: 1px solid #1A1A1A;
    cursor: pointer; transition: all 0.15s;
    gap: 16px;
  }
  .dinner-row.no-click { cursor: default; }
  .dinner-row:not(.no-click):hover { padding-left: 10px; padding-right: 10px; margin: 0 -10px; background: #0A0A0A; }

  .dinner-row-main { flex: 1; min-width: 0; }
  .dinner-row-name { font-size: 15px; color: #F0EAE0; margin-bottom: 4px; }
  .dinner-row-meta { font-size: 12px; color: #6A6560; }

  .dinner-row-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

  .other-person { font-size: 12px; color: #6A6560; font-style: italic; }

  .request-badge {
    width: 20px; height: 20px; background: #8A6E44; color: #F0EAE0;
    font-size: 10px; font-weight: 500; display: grid; place-items: center;
  }

  .status-tag {
    font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase;
    color: #3A3530; padding: 3px 8px; border: 1px solid #1A1A1A;
  }
  .status-tag.status-open { color: #6B8F72; border-color: #2A3D2E; }
  .status-tag.status-interest_check { color: #8A6E44; border-color: #3D3020; }
  .status-tag.status-accepted { color: #6B8F72; border-color: #2A3D2E; }

  .row-arrow { font-size: 14px; color: #3A3530; }
`;
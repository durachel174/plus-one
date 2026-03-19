"use client";

import { useState, useRef } from "react";

const STARTING_POINTS = [
  "What's a meal you'd cross town for?",
  "What's a place you keep going back to?",
  "What's a meal you keep thinking about?",
  "What makes you leave dinner thinking, yeah, that was worth it?",
];

export default function AliveQuestion({ value, onChange }) {
  const [helpOpen, setHelpOpen] = useState(false);
  const [keywords, setKeywords] = useState("");
  const [generating, setGenerating] = useState(false);
  const textareaRef = useRef(null);

  const focusTextarea = () => {
    setTimeout(() => textareaRef.current?.focus(), 0);
  };

  const useStartingPoint = (q) => {
    onChange(q);
    focusTextarea();
    // drawer stays open — let host tweak before closing
  };

  const generateQuestion = async () => {
    if (!keywords.trim()) return;
    setGenerating(true);

    try {
      const res = await fetch("/api/alive-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords }),
      });
      const data = await res.json();
      if (data.question) {
        onChange(data.question);
        setHelpOpen(false);
        setKeywords("");
        focusTextarea();
      }
    } catch (_) {
      // silent fail
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <style>{componentCss}</style>

      <div className="alive-field">
        <label className="label">Before you meet</label>
        <div className="alive-sublabel">Keep it short. Something easy to answer before dinner.</div>

        <textarea
          ref={textareaRef}
          className="textarea alive-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="What's a place you keep going back to?"
          maxLength={140}
          rows={2}
        />

        <div className="alive-meta">
          <button
            className="alive-help-trigger"
            onClick={() => setHelpOpen((o) => !o)}
            type="button"
          >
            {helpOpen ? "Never mind" : "Not sure? I can help"}
          </button>
          <span className="alive-char" data-warn={value.length > 110}>
            {value.length}/140
          </span>
        </div>

        {helpOpen && (
          <div className="alive-drawer">

            <div className="drawer-section">
              <div className="drawer-label">A few starting points</div>
              <div className="drawer-suggestions">
                {STARTING_POINTS.map((q) => (
                  <button
                    key={q}
                    className="suggestion-pill"
                    onClick={() => useStartingPoint(q)}
                    type="button"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="drawer-section drawer-section--generate">
              <div className="drawer-label">Or, help me write one</div>
              <div className="drawer-hint">
                What kind of night is this, and what do you want to get a sense of?
              </div>
              <div className="drawer-input-row">
                <input
                  className="input drawer-input"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="e.g. casual, comfort food, low-key"
                  onKeyDown={(e) => e.key === "Enter" && generateQuestion()}
                />
                <button
                  className="drawer-generate-btn"
                  onClick={generateQuestion}
                  disabled={!keywords.trim() || generating}
                  type="button"
                >
                  {generating ? "Writing…" : "Draft →"}
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </>
  );
}

const componentCss = `
  .alive-field { margin-bottom: 20px; }

  .alive-sublabel {
    font-size: 11px;
    color: #3A3530;
    margin-bottom: 8px;
    line-height: 1.5;
  }

  .alive-textarea {
    width: 100%;
    background: #0E0E0E;
    border: 1px solid #232323;
    border-left: 2px solid #2A3D2E;
    color: #F0EAE0;
    font-family: 'DM Sans', sans-serif;
    font-weight: 300;
    font-size: 14px;
    padding: 11px 14px;
    outline: none;
    resize: none;
    line-height: 1.65;
    transition: border-color 0.2s, border-left-color 0.2s;
  }
  .alive-textarea:focus {
    border-color: #2E2E2E;
    border-left-color: #6B8F72;
  }
  .alive-textarea::placeholder { color: #3A3530; }

  .alive-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 6px;
  }

  .alive-help-trigger {
    font-size: 11px;
    color: #6A6560;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
    font-family: 'DM Sans', sans-serif;
    font-weight: 300;
    text-decoration: underline;
    text-underline-offset: 3px;
    text-decoration-color: #2E2E2E;
    transition: color 0.15s;
  }
  .alive-help-trigger:hover { color: #C9A96E; text-decoration-color: #C9A96E; }

  .alive-char {
    font-size: 11px;
    color: #3A3530;
    font-variant-numeric: tabular-nums;
    transition: color 0.2s;
  }
  .alive-char[data-warn="true"] { color: #8A6E44; }

  .alive-drawer {
    border: 1px solid #232323;
    border-top: none;
    background: #0A0A0A;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .drawer-section--generate { border-top: 1px solid #1A1A1A; padding-top: 16px; }

  .drawer-label {
    font-size: 10px;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #3A3530;
    margin-bottom: 10px;
  }

  .drawer-hint {
    font-size: 12px;
    color: #6A6560;
    margin-bottom: 10px;
    line-height: 1.6;
  }

  .drawer-suggestions { display: flex; flex-direction: column; gap: 6px; }

  .suggestion-pill {
    text-align: left;
    background: none;
    border: 1px solid #1A1A1A;
    color: #6A6560;
    font-family: 'DM Sans', sans-serif;
    font-weight: 300;
    font-size: 13px;
    padding: 8px 12px;
    cursor: pointer;
    font-style: italic;
    transition: border-color 0.15s, color 0.15s;
  }
  .suggestion-pill:hover { border-color: #2A3D2E; color: #F0EAE0; }

  .drawer-input-row { display: flex; gap: 8px; }

  .drawer-input {
    flex: 1;
    background: #0E0E0E;
    border: 1px solid #232323;
    color: #F0EAE0;
    font-family: 'DM Sans', sans-serif;
    font-weight: 300;
    font-size: 13px;
    padding: 9px 12px;
    outline: none;
  }
  .drawer-input:focus { border-color: #2E2E2E; }
  .drawer-input::placeholder { color: #3A3530; }

  .drawer-generate-btn {
    padding: 9px 16px;
    border: 1px solid #232323;
    background: none;
    color: #6A6560;
    font-family: 'DM Sans', sans-serif;
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    white-space: nowrap;
    transition: border-color 0.15s, color 0.15s;
  }
  .drawer-generate-btn:hover:not(:disabled) { border-color: #8A6E44; color: #C9A96E; }
  .drawer-generate-btn:disabled { color: #2E2E2E; cursor: default; }
`;
"use client"
import { useState } from "react";

// ── Prompt (mirrored from server for display only — never used to call API) ──
const SYSTEM_PROMPT = `You are generating Dinner Card content for Plus One, a curated social dining app.

A Dinner Card helps potential guests understand the vibe of a dinner before requesting a seat. It should feel warm, specific, and written like a thoughtful person — not a product description.

Rules:
- card_title: "Restaurant — Day Time" format. Clean, no punctuation flourishes.
- card_summary: Exactly 2 sentences. Describe the experience, not just the food. What will the night feel like?
- card_good_match: Array of exactly 3 short phrases (5 words or fewer each). Start each with a verb or adjective.
- dining_style: one of tasting_menu | casual | fine_dining | street_food | mixed
- social_energy: one of low_key | moderate | social

Return ONLY valid JSON. No markdown, no explanation, no extra fields.`;

function buildUserPrompt(f) {
  return `Restaurant: ${f.restaurant}\nDate/time: ${f.date} at ${f.time}\nPrice range: ${f.price}\nHost note: ${f.note}`;
}

const PRESETS = [
  { name: "Messy but genuine", restaurant: "State Bird Provisions", date: "Saturday March 21", time: "7pm", price: "$$$", note: "booked it last month friend cancelled love trying creative restaurants this place does incredible small plates looking for someone equally into the food" },
  { name: "Terse host", restaurant: "Birdsong", date: "Sunday", time: "6:30", price: "$$$$", note: "tasting menu. friend bailed. open seat." },
  { name: "Very detailed", restaurant: "Zuni Café", date: "Friday March 27", time: "7:30pm", price: "$$", note: "Going for the roast chicken, been wanting to try it for years. My usual dinner partner moved to NYC so I have a spare seat. Would love someone who appreciates a classic SF institution and doesn't need things to be fancy — just good food and easy conversation." },
  { name: "Casual energy", restaurant: "Tacos El Gordo", date: "Thursday", time: "8pm", price: "$", note: "love this place. always go alone feels weird. bring someone who eats real tacos" },
  { name: "Fine dining", restaurant: "Atelier Crenn", date: "Saturday", time: "8:30pm", price: "$$$$", note: "Splurging on Crenn for my birthday, my guest had a family thing come up. This is a special one — poetic culinaria tasting menu. Want someone who understands what that means and will actually appreciate each course." },
];

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500&family=DM+Mono:wght@300;400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --black: #080808; --surface: #0E0E0E; --lift: #141414; --lift2: #1A1A1A;
    --border: #232323; --border2: #2E2E2E;
    --gold: #C9A96E; --gold-dim: #8A6E44;
    --cream: #F0EAE0; --white: #FAFAF8;
    --muted: #6A6560; --dim: #3A3530;
    --green: #6B8F72; --red: #8F4A42; --amber: #A07840;
  }
  html, body { background: var(--black); color: var(--cream); font-family: 'DM Sans', sans-serif; font-weight: 300; min-height: 100vh; }
  .serif { font-family: 'Cormorant Garamond', serif; }
  .mono { font-family: 'DM Mono', monospace; }

  /* Layout */
  .app { display: grid; grid-template-columns: 340px 1fr; min-height: 100vh; }
  .left { border-right: 1px solid var(--border); display: flex; flex-direction: column; height: 100vh; position: sticky; top: 0; overflow-y: auto; }
  .right { display: flex; flex-direction: column; min-height: 100vh; overflow-y: auto; }

  /* Panel headers */
  .panel-head { padding: 20px 24px; border-bottom: 1px solid var(--border); display: flex; align-items: baseline; justify-content: space-between; flex-shrink: 0; }
  .panel-title { font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 400; color: var(--cream); }
  .panel-sub { font-size: 10px; color: var(--muted); letter-spacing: 0.08em; text-transform: uppercase; }

  /* Sections */
  .section { padding: 16px 20px; border-bottom: 1px solid var(--border); flex-shrink: 0; }
  .label { font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--muted); margin-bottom: 7px; display: block; }

  /* Inputs */
  .input, .textarea {
    width: 100%; background: var(--lift); border: 1px solid var(--border);
    color: var(--cream); font-family: 'DM Sans', sans-serif; font-weight: 300;
    font-size: 13px; padding: 9px 12px; outline: none; transition: border-color 0.2s;
  }
  .input:focus, .textarea:focus { border-color: var(--border2); }
  .input::placeholder, .textarea::placeholder { color: var(--dim); }
  .textarea { resize: vertical; min-height: 72px; line-height: 1.65; }
  .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }

  /* Presets */
  .preset-list { display: flex; flex-direction: column; gap: 4px; }
  .preset-btn {
    padding: 9px 12px; border: 1px solid var(--border); background: var(--surface);
    cursor: pointer; transition: border-color 0.15s; text-align: left;
    font-family: 'DM Sans', sans-serif; width: 100%;
  }
  .preset-btn:hover { border-color: var(--border2); }
  .preset-btn.active { border-color: var(--gold-dim); }
  .preset-name { font-size: 11px; color: var(--cream); font-weight: 400; margin-bottom: 2px; }
  .preset-preview { font-size: 11px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

  /* Prompt preview */
  .prompt-wrap { padding: 16px 20px; flex: 1; min-height: 0; overflow: hidden; display: flex; flex-direction: column; }
  .prompt-toggle { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); cursor: pointer; display: flex; align-items: center; gap: 8px; margin-bottom: 10px; background: none; border: none; font-family: 'DM Sans', sans-serif; padding: 0; }
  .prompt-toggle:hover { color: var(--cream); }
  .prompt-chevron { font-size: 9px; transition: transform 0.2s; }
  .prompt-chevron.open { transform: rotate(90deg); }
  .prompt-box { background: var(--surface); border: 1px solid var(--border); padding: 12px; font-family: 'DM Mono', monospace; font-size: 11px; line-height: 1.7; overflow-y: auto; flex: 1; }
  .p-sys { color: var(--gold-dim); }
  .p-sep { color: var(--dim); }
  .p-usr { color: var(--muted); }

  /* Run button */
  .run-section { padding: 14px 20px; border-top: 1px solid var(--border); flex-shrink: 0; }
  .btn-run { width: 100%; padding: 12px; background: var(--cream); color: var(--black); border: none; font-family: 'DM Sans', sans-serif; font-weight: 500; font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase; cursor: pointer; transition: background 0.2s; }
  .btn-run:hover:not(:disabled) { background: var(--white); }
  .btn-run:disabled { background: var(--lift2); color: var(--muted); cursor: default; }

  /* Status bar */
  .status { padding: 9px 24px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 12px; font-size: 11px; min-height: 38px; background: var(--surface); flex-shrink: 0; }
  .dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .dot-idle { background: var(--dim); }
  .dot-running { background: var(--gold-dim); animation: blink 1s infinite; }
  .dot-ok { background: var(--green); }
  .dot-warn { background: var(--amber); }
  .dot-err { background: var(--red); }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.25} }
  .status-msg { color: var(--muted); }
  .status-time { margin-left: auto; color: var(--dim); font-family: 'DM Mono', monospace; font-size: 10px; }
  .status-tokens { color: var(--dim); font-family: 'DM Mono', monospace; font-size: 10px; }

  /* Tabs */
  .tabs { display: flex; border-bottom: 1px solid var(--border); flex-shrink: 0; }
  .tab-btn { padding: 10px 20px; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); cursor: pointer; border: none; border-bottom: 1px solid transparent; margin-bottom: -1px; background: none; font-family: 'DM Sans', sans-serif; transition: color 0.15s; }
  .tab-btn.active { color: var(--cream); border-bottom-color: var(--cream); }
  .tab-btn:hover:not(.active) { color: var(--cream); }
  .tab-badge { display: inline-block; margin-left: 5px; padding: 1px 5px; background: var(--lift2); font-size: 9px; border-radius: 2px; }

  /* Content area */
  .content { padding: 24px; flex: 1; }

  /* Empty state */
  .empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 40px; text-align: center; gap: 10px; }
  .empty-title { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 300; color: var(--muted); }
  .empty-sub { font-size: 12px; color: var(--dim); line-height: 1.7; max-width: 240px; }

  /* Error */
  .err-box { margin: 24px; padding: 16px; border: 1px solid var(--red); background: var(--lift); }
  .err-label { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--red); margin-bottom: 6px; }
  .err-msg { font-size: 12px; color: var(--muted); line-height: 1.6; font-family: 'DM Mono', monospace; }

  /* Side-by-side */
  .side-by-side { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .side-label { font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--dim); margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
  .side-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }
  .raw-note { background: var(--surface); border: 1px solid var(--border); padding: 14px; font-size: 12px; color: var(--muted); line-height: 1.7; font-style: italic; font-weight: 300; }

  /* Dinner card */
  .dcard { border: 1px solid var(--border); background: var(--surface); }
  .dcard-top { padding: 20px 20px 14px; border-bottom: 1px solid var(--border); }
  .dcard-rest { font-family: 'Cormorant Garamond', serif; font-size: 20px; font-weight: 400; color: var(--cream); margin-bottom: 4px; }
  .dcard-meta { font-size: 11px; color: var(--muted); display: flex; gap: 10px; }
  .dcard-mid { padding: 14px 20px; border-bottom: 1px solid var(--border); }
  .dcard-sum { font-size: 12px; color: var(--muted); line-height: 1.75; margin-bottom: 12px; font-weight: 300; }
  .dcard-match-lbl { font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--dim); margin-bottom: 8px; }
  .dcard-tags { display: flex; flex-wrap: wrap; gap: 5px; }
  .dcard-tag { font-size: 11px; padding: 3px 9px; border: 1px solid var(--border); color: var(--muted); }
  .dcard-bot { padding: 12px 20px; display: flex; align-items: center; gap: 10px; }
  .dcard-hname { font-size: 11px; color: var(--cream); }
  .dcard-attrs { font-size: 10px; color: var(--dim); margin-top: 2px; font-family: 'DM Mono', monospace; }
  .dcard-seat { margin-left: auto; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--green); border: 1px solid var(--green); padding: 2px 8px; opacity: 0.75; }

  /* JSON view */
  .json-box { background: var(--surface); border: 1px solid var(--border); padding: 16px; font-family: 'DM Mono', monospace; font-size: 11px; line-height: 1.75; overflow-x: auto; white-space: pre; }
  .jk { color: var(--gold-dim); } .js { color: #7DAA7D; } .jn { color: #7A8DAA; } .jb { color: var(--muted); }

  /* Eval */
  .eval-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
  .eval-card { padding: 12px 14px; border: 1px solid var(--border); background: var(--lift); }
  .eval-name { font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--dim); margin-bottom: 5px; }
  .eval-result { font-size: 12px; font-weight: 400; }
  .eval-result.ok { color: var(--green); }
  .eval-result.warn { color: var(--amber); }
  .eval-result.fail { color: var(--red); }
  .eval-hint { font-size: 10px; color: var(--dim); margin-top: 4px; line-height: 1.5; }
  .eval-summary { padding: 12px 14px; border: 1px solid var(--border); margin-bottom: 14px; display: flex; align-items: center; gap: 12px; }
  .eval-summary-score { font-family: 'Cormorant Garamond', serif; font-size: 32px; color: var(--cream); }
  .eval-summary-label { font-size: 11px; color: var(--muted); }

  /* History */
  .hist-item { padding: 12px 14px; border: 1px solid var(--border); background: var(--surface); margin-bottom: 6px; cursor: pointer; transition: border-color 0.15s; }
  .hist-item:hover { border-color: var(--border2); }
  .hist-top { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
  .hist-rest { font-size: 12px; color: var(--cream); font-weight: 400; flex: 1; }
  .hist-time { font-size: 10px; color: var(--dim); font-family: 'DM Mono', monospace; }
  .hist-badge { font-size: 10px; padding: 1px 7px; border: 1px solid; }
  .hist-badge.ok { color: var(--green); border-color: var(--green); opacity: 0.7; }
  .hist-badge.warn { color: var(--amber); border-color: var(--amber); opacity: 0.7; }
  .hist-badge.fail { color: var(--red); border-color: var(--red); opacity: 0.7; }
  .hist-note { font-size: 11px; color: var(--muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .hist-rerun { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); background: none; border: 1px solid var(--border); padding: 4px 10px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.15s; }
  .hist-rerun:hover { color: var(--cream); border-color: var(--border2); }
`;

function highlightJSON(obj) {
  const str = JSON.stringify(obj, null, 2);
  return str.replace(
    /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(\s*:)?|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (m) => {
      if (/^"/.test(m)) return /:$/.test(m) ? `<span class="jk">${m}</span>` : `<span class="js">${m}</span>`;
      if (/true|false/.test(m)) return `<span class="jb">${m}</span>`;
      if (/null/.test(m)) return `<span class="jb">${m}</span>`;
      return `<span class="jn">${m}</span>`;
    }
  );
}

function runEval(result) {
  const checks = [];

  const hasTitle = !!result.card_title && typeof result.card_title === "string";
  const titleHasSep = hasTitle && (result.card_title.includes("—") || result.card_title.includes("-"));
  checks.push({ name: "Title format", ok: titleHasSep, warn: false, hint: 'Must contain "—" separator', val: result.card_title || "missing" });

  const hasSummary = !!result.card_summary && typeof result.card_summary === "string";
  const sentences = hasSummary ? result.card_summary.split(/(?<=[.!?])\s+/).filter(s => s.trim()) : [];
  const sentenceOk = sentences.length === 2;
  checks.push({ name: "Summary sentences", ok: sentenceOk, warn: !sentenceOk && sentences.length > 0, hint: `Exactly 2 required · got ${sentences.length}`, val: sentenceOk ? "2 sentences ✓" : `${sentences.length} sentences` });

  const tagsOk = Array.isArray(result.card_good_match) && result.card_good_match.length === 3;
  const tagsWarn = Array.isArray(result.card_good_match) && result.card_good_match.length !== 3;
  checks.push({ name: "Match tags count", ok: tagsOk, warn: tagsWarn, hint: "Exactly 3 required", val: Array.isArray(result.card_good_match) ? `${result.card_good_match.length} tags` : "not an array" });

  const validStyles = ["tasting_menu","casual","fine_dining","street_food","mixed"];
  const styleOk = validStyles.includes(result.dining_style);
  checks.push({ name: "dining_style enum", ok: styleOk, warn: false, hint: validStyles.join(" | "), val: result.dining_style || "missing" });

  const validEnergy = ["low_key","moderate","social"];
  const energyOk = validEnergy.includes(result.social_energy);
  checks.push({ name: "social_energy enum", ok: energyOk, warn: false, hint: validEnergy.join(" | "), val: result.social_energy || "missing" });

  const passed = checks.filter(c => c.ok).length;
  return { checks, passed, total: checks.length };
}

function evalStatus(passed, total) {
  if (passed === total) return "ok";
  if (passed >= total - 1) return "warn";
  return "fail";
}

export default function App() {
  const [fields, setFields] = useState(PRESETS[0]);
  const [activePreset, setActivePreset] = useState(0);
  const [promptOpen, setPromptOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState(null); // full server response
  const [tab, setTab] = useState("card");
  const [history, setHistory] = useState([]);

  const set = (k, v) => { setFields(f => ({ ...f, [k]: v })); setActivePreset(null); };

  const loadPreset = (i) => { setFields(PRESETS[i]); setActivePreset(i); };

  const run = async (overrideFields) => {
    const f = overrideFields || fields;
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("/api/test-dinner-card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(f),
      });

      const data = await res.json();
      setResponse(data);

      if (data.result) {
        const ev = runEval(data.result);
        const status = evalStatus(ev.passed, ev.total);
        setHistory(h => [{ fields: { ...f }, response: data, eval: ev, status, ts: Date.now() }, ...h.slice(0, 14)]);
        setTab("card");
      } else {
        setTab("json");
      }
    } catch (e) {
      setResponse({ success: false, error: `Network error: ${e.message}` });
    } finally {
      setLoading(false);
    }
  };

  const result = response?.result;
  const ev = result ? runEval(result) : null;
  const tags = result?.card_good_match
    ? (Array.isArray(result.card_good_match) ? result.card_good_match : result.card_good_match.split("|").map(s => s.trim()))
    : [];

  return (
    <>
      <style>{css}</style>
      <div className="app">

        {/* ── LEFT ── */}
        <div className="left">
          <div className="panel-head">
            <span className="panel-title serif">Dinner Card</span>
            <span className="panel-sub">Prompt tester</span>
          </div>

          <div className="section">
            <div className="label" style={{marginBottom:8}}>Presets</div>
            <div className="preset-list">
              {PRESETS.map((p, i) => (
                <button key={i} className={`preset-btn ${activePreset === i ? "active" : ""}`} onClick={() => loadPreset(i)}>
                  <div className="preset-name">{p.name}</div>
                  <div className="preset-preview">{p.note}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="section">
            <label className="label">Restaurant</label>
            <input className="input" value={fields.restaurant} onChange={e => set("restaurant", e.target.value)} placeholder="Restaurant name" />
          </div>

          <div className="section">
            <div className="field-row">
              <div><label className="label">Date</label><input className="input" value={fields.date} onChange={e => set("date", e.target.value)} placeholder="e.g. Saturday" /></div>
              <div><label className="label">Time</label><input className="input" value={fields.time} onChange={e => set("time", e.target.value)} placeholder="e.g. 7pm" /></div>
            </div>
          </div>

          <div className="section">
            <label className="label">Price</label>
            <input className="input" value={fields.price} onChange={e => set("price", e.target.value)} placeholder="$, $$, $$$, $$$$" />
          </div>

          <div className="section" style={{flexShrink:0}}>
            <label className="label">Host note</label>
            <textarea className="textarea" style={{minHeight:90}} value={fields.note} onChange={e => set("note", e.target.value)} placeholder="Paste raw host input here..." />
          </div>

          <div className="prompt-wrap">
            <button className="prompt-toggle" onClick={() => setPromptOpen(o => !o)}>
              <span className={`prompt-chevron ${promptOpen ? "open" : ""}`}>▶</span>
              Full system prompt
            </button>
            {promptOpen && (
              <div className="prompt-box">
                <span className="p-sys">{SYSTEM_PROMPT}</span>
                <span className="p-sep">{"\n\n---\n\n"}</span>
                <span className="p-usr">{buildUserPrompt(fields)}</span>
              </div>
            )}
          </div>

          <div className="run-section">
            <button className="btn-run" onClick={() => run()} disabled={loading || !fields.note.trim()}>
              {loading ? "Running..." : "Run test →"}
            </button>
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="right">
          <div className="panel-head">
            <span className="panel-title serif">Output</span>
            <span className="panel-sub">{history.length > 0 ? `${history.length} run${history.length !== 1 ? "s" : ""}` : "No runs yet"}</span>
          </div>

          <div className="status">
            <div className={`dot ${loading ? "dot-running" : !response ? "dot-idle" : response.success ? (ev && ev.passed < ev.total ? "dot-warn" : "dot-ok") : "dot-err"}`} />
            <div className="status-msg">
              {loading ? "Calling /api/test-dinner-card..." :
               !response ? "Ready" :
               response.success ? `Success · ${ev?.passed}/${ev?.total} checks passed${response.parseMethod === "extracted" ? " · JSON extracted from prose" : ""}` :
               `Error · ${response.error}`}
            </div>
            {response?.elapsed && <div className="status-time">{(response.elapsed / 1000).toFixed(2)}s</div>}
            {response?.usage && <div className="status-tokens">{response.usage.input_tokens}↑ {response.usage.output_tokens}↓</div>}
          </div>

          {!response && !loading && (
            <div className="empty">
              <div className="empty-title serif">No output yet</div>
              <div className="empty-sub">Select a preset or write a host note, then run the test.</div>
            </div>
          )}

          {response && !response.success && (
            <div className="err-box">
              <div className="err-label">Error</div>
              <div className="err-msg">{response.error}</div>
              {response.raw && <><br /><div className="err-label">Raw output</div><div className="err-msg" style={{marginTop:6}}>{response.raw}</div></>}
            </div>
          )}

          {result && (
            <>
              <div className="tabs">
                <button className={`tab-btn ${tab==="card"?"active":""}`} onClick={() => setTab("card")}>Side by side</button>
                <button className={`tab-btn ${tab==="json"?"active":""}`} onClick={() => setTab("json")}>Raw JSON</button>
                <button className={`tab-btn ${tab==="eval"?"active":""}`} onClick={() => setTab("eval")}>
                  Quality check
                  {ev && <span className={`tab-badge`} style={{color: ev.passed===ev.total?"var(--green)":ev.passed>=ev.total-1?"var(--amber)":"var(--red)"}}>{ev.passed}/{ev.total}</span>}
                </button>
                <button className={`tab-btn ${tab==="hist"?"active":""}`} onClick={() => setTab("hist")}>
                  History {history.length > 0 && <span className="tab-badge">{history.length}</span>}
                </button>
              </div>

              <div className="content">

                {tab === "card" && (
                  <div className="side-by-side">
                    <div>
                      <div className="side-label">Host note (raw input)</div>
                      <div className="raw-note">"{fields.note}"</div>
                      <div style={{marginTop:14}}>
                        <div className="side-label">Input fields</div>
                        <div style={{fontSize:11,color:"var(--dim)",fontFamily:"DM Mono, monospace",lineHeight:1.8}}>
                          restaurant: {fields.restaurant}<br/>
                          date: {fields.date} · time: {fields.time}<br/>
                          price: {fields.price}
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="side-label">Generated Dinner Card</div>
                      <div className="dcard">
                        <div className="dcard-top">
                          <div className="dcard-rest">{result.card_title?.split("—")[0]?.trim() || fields.restaurant}</div>
                          <div className="dcard-meta">
                            <span>{result.card_title?.split("—")[1]?.trim() || `${fields.date} · ${fields.time}`}</span>
                            <span style={{color:"var(--dim)"}}>·</span>
                            <span>{fields.price}</span>
                          </div>
                        </div>
                        <div className="dcard-mid">
                          <p className="dcard-sum">{result.card_summary}</p>
                          <div className="dcard-match-lbl">Good match if you</div>
                          <div className="dcard-tags">
                            {tags.map((t, i) => <span key={i} className="dcard-tag">{t}</span>)}
                          </div>
                        </div>
                        <div className="dcard-bot">
                          <div>
                            <div className="dcard-hname">Hosted by Alex M.</div>
                            <div className="dcard-attrs">dining_style: {result.dining_style} · energy: {result.social_energy}</div>
                          </div>
                          <div className="dcard-seat">1 seat</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {tab === "json" && (
                  <>
                    <div className="side-label">Raw JSON response</div>
                    <div className="json-box" dangerouslySetInnerHTML={{ __html: highlightJSON(response) }} />
                  </>
                )}

                {tab === "eval" && ev && (
                  <>
                    <div className="eval-summary">
                      <div className="eval-summary-score serif">{ev.passed}/{ev.total}</div>
                      <div>
                        <div className="eval-summary-label" style={{color: evalStatus(ev.passed,ev.total)==="ok"?"var(--green)":evalStatus(ev.passed,ev.total)==="warn"?"var(--amber)":"var(--red)"}}>
                          {evalStatus(ev.passed,ev.total)==="ok" ? "All checks passed" : `${ev.total - ev.passed} check${ev.total-ev.passed>1?"s":""} failed`}
                        </div>
                        {response.validationErrors?.length > 0 && (
                          <div style={{fontSize:11,color:"var(--muted)",marginTop:4}}>Server: {response.validationErrors.join(" · ")}</div>
                        )}
                      </div>
                    </div>
                    <div className="eval-grid">
                      {ev.checks.map((c, i) => (
                        <div key={i} className="eval-card">
                          <div className="eval-name">{c.name}</div>
                          <div className={`eval-result ${c.ok ? "ok" : c.warn ? "warn" : "fail"}`}>
                            {c.ok ? "✓ " : c.warn ? "⚠ " : "✗ "}{c.val}
                          </div>
                          <div className="eval-hint">{c.hint}</div>
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {tab === "hist" && (
                  <>
                    <div className="side-label">Run history</div>
                    {history.length === 0 && <div style={{fontSize:12,color:"var(--dim)"}}>No runs yet.</div>}
                    {history.map((h, i) => (
                      <div key={i} className="hist-item" onClick={() => { setResponse(h.response); setTab("card"); }}>
                        <div className="hist-top">
                          <div className="hist-rest">{h.fields.restaurant}</div>
                          <span className={`hist-badge ${h.status}`}>{h.eval.passed}/{h.eval.total}</span>
                          <div className="hist-time">{(h.response.elapsed/1000).toFixed(2)}s</div>
                          <button className="hist-rerun" onClick={e => { e.stopPropagation(); loadPreset(null); setFields(h.fields); run(h.fields); }}>Rerun</button>
                        </div>
                        <div className="hist-note">"{h.fields.note}"</div>
                      </div>
                    ))}
                  </>
                )}

              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
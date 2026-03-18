import { redirect } from "next/navigation";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <style>{css}</style>
      <main className="landing">

        {/* Hero */}
        <section className="hero">
          <div className="hero-bg" />
          <div className="hero-grain" />
          <div className="hero-inner">
            <div className="hero-kicker">
              <span />
              San Francisco · Members only
              <span />
            </div>
            <h1 className="hero-title">
              A table<br />for <em>one more</em>
            </h1>
            <p className="hero-sub">
              You made the reservation. Your friend cancelled.<br />
              Plus One connects you with someone who shares your taste.
            </p>
            <div className="hero-ctas">
              <Link href="/host" className="btn-solid">Host a dinner</Link>
              <Link href="/feed" className="btn-outline">Browse this week</Link>
            </div>
            <div className="hero-proof">
              <div className="proof">
                <div className="proof-n">3</div>
                <div className="proof-l">Dinners this week</div>
              </div>
              <div className="proof">
                <div className="proof-n">1 day</div>
                <div className="proof-l">Average to fill</div>
              </div>
              <div className="proof">
                <div className="proof-n">86%</div>
                <div className="proof-l">Avg. match score</div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="how">
          {[
            {
              n: "I",
              title: "Host posts a seat",
              desc: "You have a reservation and an empty chair. Write a note — AI turns it into a Dinner Card that shows exactly what kind of night you're planning.",
            },
            {
              n: "II",
              title: "Guests request to join",
              desc: "You see who wants to come, why they want to join, and how compatible you are. You decide. No obligation.",
            },
            {
              n: "III",
              title: "The dinner happens",
              desc: "Once you accept, both parties get contact details. No algorithm, no surprises — just a good dinner with someone who deserved the seat.",
            },
          ].map((h) => (
            <div key={h.n} className="how-cell">
              <div className="how-n">{h.n}</div>
              <div className="how-title">{h.title}</div>
              <p className="how-desc">{h.desc}</p>
            </div>
          ))}
        </section>

        {/* CTA strip */}
        <section className="cta-strip">
          <div className="cta-strip-inner">
            <div className="cta-title">Ready to join a table?</div>
            <div className="cta-buttons">
              <Link href="/feed" className="btn-solid">Browse this week's dinners</Link>
              <Link href="/login" className="btn-outline">Create an account</Link>
            </div>
          </div>
        </section>

      </main>
    </>
  );
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #080808; color: #F0EAE0; font-family: 'DM Sans', sans-serif; font-weight: 300; }

  .landing { display: flex; flex-direction: column; }

  /* ── HERO ── */
  .hero {
    min-height: calc(100vh - 60px);
    display: flex; align-items: center; justify-content: center;
    padding: 80px 40px; position: relative; overflow: hidden;
  }
  .hero-bg {
    position: absolute; inset: 0;
    background: radial-gradient(ellipse 100% 80% at 50% 60%, #1A1208 0%, #080808 65%);
    pointer-events: none;
  }
  .hero-grain {
    position: absolute; inset: 0; opacity: 0.025; pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  }
  .hero-inner {
    position: relative; z-index: 1;
    max-width: 720px; text-align: center;
    display: flex; flex-direction: column; align-items: center;
  }
  .hero-kicker {
    font-size: 10px; letter-spacing: 0.28em; text-transform: uppercase;
    color: #8A6E44; margin-bottom: 40px;
    display: flex; align-items: center; gap: 16px;
  }
  .hero-kicker span { display: block; width: 32px; height: 1px; background: #3A3530; }

  .hero-title {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(64px, 10vw, 108px);
    font-weight: 300; line-height: 0.95;
    color: #F0EAE0; letter-spacing: -0.01em;
    margin-bottom: 32px;
  }
  .hero-title em { font-style: italic; color: #C9A96E; }

  .hero-sub {
    font-size: 15px; font-weight: 300; color: #6A6560;
    line-height: 1.8; max-width: 420px; margin-bottom: 48px;
    letter-spacing: 0.02em;
  }

  .hero-ctas { display: flex; gap: 12px; margin-bottom: 72px; }

  .btn-solid {
    padding: 13px 32px; background: #F0EAE0; color: #080808;
    font-family: 'DM Sans', sans-serif; font-weight: 500;
    font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
    text-decoration: none; transition: background 0.2s; display: inline-block;
  }
  .btn-solid:hover { background: #FAFAF8; }

  .btn-outline {
    padding: 13px 32px; background: transparent; color: #6A6560;
    border: 1px solid #2E2E2E;
    font-family: 'DM Sans', sans-serif; font-weight: 300;
    font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
    text-decoration: none; transition: all 0.2s; display: inline-block;
  }
  .btn-outline:hover { color: #F0EAE0; border-color: #6A6560; }

  .hero-proof {
    display: flex; gap: 64px;
    padding-top: 40px; border-top: 1px solid #232323;
    width: 100%;  justify-content: center;
  }
  .proof { text-align: center; }
  .proof-n {
    font-family: 'Cormorant Garamond', serif; font-size: 36px;
    font-weight: 300; color: #F0EAE0; letter-spacing: -0.02em;
  }
  .proof-l { font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: #6A6560; margin-top: 6px; }

  /* ── HOW ── */
  .how {
    display: grid; grid-template-columns: 1fr 1fr 1fr;
    border-top: 1px solid #232323;
  }
  .how-cell {
    padding: 56px 48px; border-right: 1px solid #232323;
  }
  .how-cell:last-child { border-right: none; }
  .how-n {
    font-family: 'Cormorant Garamond', serif; font-size: 11px;
    letter-spacing: 0.2em; color: #3A3530; margin-bottom: 20px;
    text-transform: uppercase;
  }
  .how-title {
    font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 400;
    color: #F0EAE0; margin-bottom: 14px;
  }
  .how-desc { font-size: 13px; color: #6A6560; line-height: 1.75; font-weight: 300; }

  /* ── CTA STRIP ── */
  .cta-strip {
    border-top: 1px solid #232323;
    padding: 80px 40px;
    display: flex; justify-content: center;
  }
  .cta-strip-inner { text-align: center; }
  .cta-title {
    font-family: 'Cormorant Garamond', serif; font-size: 36px;
    font-weight: 300; color: #F0EAE0; margin-bottom: 32px;
  }
  .cta-buttons { display: flex; gap: 12px; justify-content: center; }
`;
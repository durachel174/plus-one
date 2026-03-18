import Link from "next/link";

export default function Home() {
  return (
    <>
      <style>{css}</style>
      <main className="landing">

        {/* Hero — membership first */}
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
              A small dining club for people who care about where they're going,
              who they're dining with, and how the night feels.
            </p>
            <Link href="/membership" className="btn-primary">
              Request membership
            </Link>
            <p className="hero-note">
              Membership is free. We review requests to keep dinners feeling right.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="how">
          {[
            {
              n: "I",
              title: "Host posts a seat",
              desc: "A reservation already exists and a seat opens up. The host writes a note — AI turns it into a Dinner Card that shows exactly what kind of night they're planning.",
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

        {/* Not a date. Not networking. */}
        <section className="manifesto">
          <div className="manifesto-inner">
            <p className="manifesto-line">Not a date.</p>
            <p className="manifesto-line">Not networking.</p>
            <p className="manifesto-line manifesto-line--gold">
              Just two people who both wanted to be there.
            </p>
          </div>
        </section>

        {/* Explore — secondary */}
        <section className="explore">
          <div className="explore-inner">
            <div className="explore-label">Want to explore first?</div>
            <div className="explore-desc">
              See how dinners are listed and what hosting looks like before you apply.
            </div>
            <div className="explore-links">
              <Link href="/feed" className="btn-ghost">Browse this week's dinners</Link>
              <Link href="/host-preview" className="btn-ghost">See how hosting works</Link>
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
    max-width: 640px; text-align: center;
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
    line-height: 1.8; max-width: 400px; margin-bottom: 48px;
    letter-spacing: 0.02em;
  }

  .btn-primary {
    padding: 15px 48px; background: #F0EAE0; color: #080808;
    font-family: 'DM Sans', sans-serif; font-weight: 500;
    font-size: 11px; letter-spacing: 0.16em; text-transform: uppercase;
    text-decoration: none; transition: background 0.2s; display: inline-block;
    margin-bottom: 16px;
  }
  .btn-primary:hover { background: #FAFAF8; }

  .hero-note {
    font-size: 11px; color: #3A3530; letter-spacing: 0.04em; line-height: 1.6;
  }

  /* ── HOW ── */
  .how {
    display: grid; grid-template-columns: 1fr 1fr 1fr;
    border-top: 1px solid #232323;
  }
  .how-cell { padding: 56px 48px; border-right: 1px solid #232323; }
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

  /* ── MANIFESTO ── */
  .manifesto {
    border-top: 1px solid #232323;
    padding: 100px 40px;
    display: flex; justify-content: center;
  }
  .manifesto-inner { text-align: center; }
  .manifesto-line {
    font-family: 'Cormorant Garamond', serif;
    font-size: clamp(32px, 5vw, 52px);
    font-weight: 300; color: #3A3530;
    line-height: 1.3; letter-spacing: -0.01em;
  }
  .manifesto-line--gold { color: #C9A96E; font-style: italic; }

  /* ── EXPLORE ── */
  .explore {
    border-top: 1px solid #1A1A1A;
    padding: 64px 40px;
    display: flex; justify-content: center;
  }
  .explore-inner { text-align: center; max-width: 480px; }
  .explore-label {
    font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase;
    color: #3A3530; margin-bottom: 12px;
  }
  .explore-desc {
    font-size: 13px; color: #3A3530; line-height: 1.7;
    margin-bottom: 24px; font-weight: 300;
  }
  .explore-links { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
  .btn-ghost {
    padding: 10px 24px; background: transparent; color: #3A3530;
    border: 1px solid #1A1A1A;
    font-family: 'DM Sans', sans-serif; font-weight: 300;
    font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
    text-decoration: none; transition: all 0.2s; display: inline-block;
  }
  .btn-ghost:hover { color: #6A6560; border-color: #232323; }
`;
import { MarkIcon, ReticleIcon } from "@/components/icons";

const tickerCats = [
  "Weddings",
  "Portraits",
  "Brand Films",
  "Events",
  "Documentary",
  "Commercial",
];

export default function Hero() {
  return (
    <>
      <section id="hero">
        <div className="eyebrow">
          <MarkIcon />
          EST. 2008 — PALESTINE
        </div>
        <img
          className="logo-hero"
          src="/logo-light.png"
          alt="Dream Studio logo"
        />
        <h1>
          Every frame, a place we call <em>home.</em>
        </h1>
        <p className="sub">
          Seventeen years photographing and filming life across Palestine —
          weddings, brands, and the moments in between — with a cinematic eye
          and a steady hand.
        </p>
        <div className="hero-ctas">
          <a href="#work" className="btn on-dark solid">
            View Our Work
          </a>
          <a href="#contact" className="btn on-dark">
            Get in Touch
          </a>
        </div>
      </section>

      <div className="ticker-strip">
        <div className="ticker-track" id="tickerTrack">
          {[0, 1].map((r) =>
            tickerCats.map((c) => (
              <span key={`${r}-${c}`}>
                <ReticleIcon />
                {c}
              </span>
            ))
          )}
        </div>
      </div>
    </>
  );
}
